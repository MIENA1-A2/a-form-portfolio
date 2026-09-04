import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function moduleAt(path,dependencies={}){
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,require:name=>{assert.ok(name in dependencies,'Unexpected dependency '+name);return dependencies[name]},console});return exports;
}
const data=moduleAt('../app/data.ts');
const effects=moduleAt('../app/studio-next/effects.ts');
test('all material and reveal presets round-trip while old documents remain valid',()=>{
 for(const surface of Object.values(effects.surfacePresets)){
  const doc=migrate();doc.pages[0].sections[0].surface=surface;doc.pages[0].sections[0].children[0].surface=surface;
  doc.pages[0].sections[0].children[0].motion={enter:true,distance:30,duration:.85,delay:0,hover:1.02,reveal:'block-wipe',stagger:.1,coverColor:'#000000',direction:'right'};
  assert.ok(validDocument(JSON.parse(JSON.stringify(doc))));
 }
 for(const preset of Object.values(effects.modelPresets)){
  const doc=migrate(),model=makeLayer('model','test-model');doc.pages[0].sections[0].children.push(model);model.model={...model.model,...preset};assert.ok(validDocument(doc));
 }
 assert.ok(validDocument(migrate()));
});
test('effect validation rejects arbitrary CSS, URLs and unbounded timing',()=>{
 for(const mutate of [l=>l.surface={...effects.cleanSurface,color:'url(https://evil.test)'},l=>l.surface={...effects.cleanSurface,grain:Infinity},l=>l.surface={...effects.cleanSurface,bevel:100},l=>l.motion.reveal='javascript:alert(1)',l=>l.motion.stagger=5,l=>l.motion.coverColor='red;display:none',l=>l.motion.direction='up']){
  const doc=migrate();mutate(doc.pages[0].sections[0].children[0]);assert.equal(validDocument(doc),false);
 }
});
test('manual reveal lines preserve blank lines and cap total stagger',()=>{
 assert.equal(JSON.stringify(effects.revealLines('ONE\r\n\nTWO')),JSON.stringify(['ONE','','TWO']));
 assert.equal(effects.lineDelay(1000,.5),2);assert.equal(effects.lineDelay(2,.1),.2);
});
const {connectLiveTarget,syncPlainText}=moduleAt('../app/studio-next/lifecycle.ts');
test('late canvas initialization ignores null and detached event targets',()=>{
 const connected=[];const connect=target=>connected.push(target);
 connectLiveTarget(null,connect);connectLiveTarget(undefined,connect);connectLiveTarget({isConnected:false},connect);
 assert.equal(connected.length,0);
 const live={isConnected:true};connectLiveTarget(live,connect);assert.equal(connected[0],live);
});
test('plain-text synchronization replaces externally modified text without child insertion',()=>{
 const node={textContent:'browser edited text'};syncPlainText(node,'saved text');assert.equal(node.textContent,'saved text');
 syncPlainText(node,'');assert.equal(node.textContent,'');
 let writes=0;const unchanged={get textContent(){return 'same'},set textContent(v){writes++}};
 syncPlainText(unchanged,'same');assert.equal(writes,0);
});
const content=JSON.parse(readFileSync(new URL('../app/site-content.json',import.meta.url),'utf8'));
const {migrate,referenceSkeletonHome,upgradeLegacyDocument,makeLayer,validDocument,patchBox,boxAt,updateLayer,typographyAt,fontWeights}=moduleAt('../app/studio-next/document.ts',{'../data':data,'../site-content.json':content,'./effects':effects});
test('font weights preserve legacy appearance and support all nine real Inter faces',()=>{
 const doc=migrate(),layer=doc.pages[0].sections.flatMap(s=>s.children).find(l=>l.type==='text'&&(l.box.fontWeight??400)===400);
 assert.ok(validDocument(doc));assert.equal(typographyAt(layer.box).fontWeight,400);assert.match(typographyAt(layer.box).fontFamily,/^Arial/);
 const renderer=readFileSync(new URL('../app/studio-next/renderer.tsx',import.meta.url),'utf8');
 for(const fontWeight of fontWeights){
  const next=patchBox(doc,layer.id,'desktop',{fontFamily:'inter',fontWeight});
  const changed=next.pages[0].sections.flatMap(s=>s.children).find(l=>l.id===layer.id);assert.ok(validDocument(JSON.parse(JSON.stringify(next))));assert.equal(typographyAt(changed.box).fontWeight,fontWeight);
  assert.ok(renderer.includes(`@fontsource/inter/${fontWeight}.css`));
  assert.match(readFileSync(new URL(`../node_modules/@fontsource/inter/${fontWeight}.css`,import.meta.url),'utf8'),new RegExp('font-weight: '+fontWeight));
 }
 assert.match(typographyAt({...layer.box,fontWeight:200}).fontFamily,/^Inter/);
 assert.match(typographyAt({...layer.box,fontWeight:700}).fontFamily,/^Arial/);
});
test('typography breakpoint overrides do not mutate desktop and reject invalid inputs',()=>{
 const doc=migrate(),layer=doc.pages[0].sections.flatMap(s=>s.children).find(l=>l.type==='text'&&(l.box.fontWeight??400)===400);
 const next=patchBox(doc,layer.id,'mobile',{fontFamily:'inter',fontWeight:800}),after=next.pages[0].sections.flatMap(s=>s.children).find(l=>l.id===layer.id);
 assert.ok(validDocument(next));assert.equal(typographyAt(boxAt(after,'mobile')).fontWeight,800);assert.equal(typographyAt(boxAt(after,'desktop')).fontWeight,400);
 for(const patch of [{fontWeight:0},{fontWeight:1000},{fontWeight:450},{fontWeight:'bold'},{fontWeight:null},{fontFamily:'url(evil)'},{unexpected:1}]){
  assert.equal(validDocument(patchBox(doc,layer.id,'desktop',patch)),false);
  assert.equal(validDocument(patchBox(doc,layer.id,'tablet',patch)),false);
 }
 const missing=migrate();delete missing.pages[0].sections[0].children[0].box.x;assert.equal(validDocument(missing),false);
});
test('migrates five pages with stable, unique nodes and a valid schema',()=>{
 const doc=migrate();assert.ok(validDocument(doc));assert.equal(doc.pages.length,5);assert.equal(JSON.stringify(doc),JSON.stringify(migrate()));assert.equal(doc.pages[0].sections[0].name,'参考图首屏');assert.equal(doc.pages[0].sections[0].children[0].text,'A /');
});
test('reference skeleton is an editable eight-section homepage with image-led compositions',()=>{
 const doc=migrate(),home=referenceSkeletonHome();doc.pages[0]=home;assert.ok(validDocument(doc));assert.equal(home.sections.length,8);assert.equal(home.sections.find(s=>s.name==='弧形视觉墙').children.length,15);assert.ok(home.sections.flatMap(s=>s.children).filter(l=>l.type==='image').length>=40);
});
test('breakpoint edits are immutable and do not change desktop',()=>{
 const doc=migrate(),layer=doc.pages[0].sections[0].children[1],original=JSON.stringify(layer.overrides);const next=patchBox(doc,layer.id,'mobile',{x:24,fontSize:45});const after=next.pages[0].sections[0].children[1];assert.equal(boxAt(after,'mobile').x,24);assert.equal(after.box.x,layer.box.x);assert.notEqual(next,doc);assert.equal(JSON.stringify(layer.overrides),original);assert.ok(validDocument(next));
});
test('image replacement retains geometry and supports undo snapshots',()=>{
 const doc=migrate(),layer=doc.pages[0].sections[0].children.find(l=>l.type==='image'),next=updateLayer(doc,layer.id,l=>({...l,src:'/images/common.png'})),after=next.pages[0].sections[0].children.find(l=>l.id===layer.id);assert.equal(after.box,layer.box);assert.equal(layer.src,'/images/phase.png');assert.ok(validDocument(next));
});
test('legacy cloud drafts upgrade only the homepage and preserve project pages',()=>{
 const legacy=migrate(),project=legacy.pages[1];legacy.pages[0].sections[0].name='Hero / 首屏';const result=upgradeLegacyDocument(legacy);assert.equal(result.upgraded,true);assert.equal(result.document.pages[0].sections[0].name,'参考图首屏');assert.equal(result.document.pages[1],project);assert.ok(validDocument(result.document));assert.equal(upgradeLegacyDocument(result.document).upgraded,false);
});
test('rejects hostile URLs, duplicate IDs, invalid geometry and dangerous SVG',()=>{
 for(const mutate of [d=>d.pages[0].sections[0].children[0].src='javascript:alert(1)',d=>d.pages[1].id=d.pages[0].id,d=>d.pages[0].sections[0].children[0].box.width=Infinity,d=>d.pages[0].sections[0].children[0].box.color='red;display:none',d=>d.pages[0].sections[0].children[0].model.svg='<svg><script>alert(1)</script></svg>',d=>d.pages[0].sections[0].children[0].src='https://evil.test/a.png',d=>d.pages[0].sections[0].children[0].overrides.mobile={position:'fixed'},d=>d.pages[0].sections[0].children[0].motion.duration=0]){const doc=structuredClone(migrate());mutate(doc);assert.equal(validDocument(doc),false);}
});
