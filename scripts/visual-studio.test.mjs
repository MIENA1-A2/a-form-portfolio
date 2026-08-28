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
const content=JSON.parse(readFileSync(new URL('../app/site-content.json',import.meta.url),'utf8'));
const {migrate,validDocument,patchBox,boxAt,updateLayer}=moduleAt('../app/studio-next/document.ts',{'../data':data,'../site-content.json':content});
test('migrates five pages with stable, unique nodes and a valid schema',()=>{
 const doc=migrate();assert.ok(validDocument(doc));assert.equal(doc.pages.length,5);assert.equal(JSON.stringify(doc),JSON.stringify(migrate()));assert.equal(doc.pages[0].sections[0].children[1].text,content.text.heroLine1);
});
test('breakpoint edits are immutable and do not change desktop',()=>{
 const doc=migrate(),layer=doc.pages[0].sections[0].children[1],original=JSON.stringify(layer.overrides);const next=patchBox(doc,layer.id,'mobile',{x:24,fontSize:45});const after=next.pages[0].sections[0].children[1];assert.equal(boxAt(after,'mobile').x,24);assert.equal(after.box.x,layer.box.x);assert.notEqual(next,doc);assert.equal(JSON.stringify(layer.overrides),original);assert.ok(validDocument(next));
});
test('image replacement retains geometry and supports undo snapshots',()=>{
 const doc=migrate(),layer=doc.pages[0].sections[0].children[2],next=updateLayer(doc,layer.id,l=>({...l,src:'/images/common.png'}));assert.equal(next.pages[0].sections[0].children[2].box,layer.box);assert.equal(layer.src,'/images/hero-final.png');assert.ok(validDocument(next));
});
test('rejects hostile URLs, duplicate IDs, invalid geometry and dangerous SVG',()=>{
 for(const mutate of [d=>d.pages[0].sections[0].children[0].src='javascript:alert(1)',d=>d.pages[1].id=d.pages[0].id,d=>d.pages[0].sections[0].children[0].box.width=Infinity,d=>d.pages[0].sections[0].children[0].box.color='red;display:none',d=>d.pages[0].sections[0].children[0].model.svg='<svg><script>alert(1)</script></svg>',d=>d.pages[0].sections[0].children[0].src='https://evil.test/a.png',d=>d.pages[0].sections[0].children[0].overrides.mobile={position:'fixed'},d=>d.pages[0].sections[0].children[0].motion.duration=0]){const doc=structuredClone(migrate());mutate(doc);assert.equal(validDocument(doc),false);}
});
