import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,createFetchMock} from 'miniflare';
import {webcrypto} from 'node:crypto';
import {seal} from '../worker/index.ts';

test('cloud drafts, atomic conflicts, publication and owner-only access in real Workers runtime',async()=>{
 const bundled=await build({entryPoints:[new URL('../worker/entry.ts',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')],bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers']});
 const documentBundle=await build({entryPoints:[new URL('../app/studio-next/document.ts',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')],bundle:true,write:false,format:'esm',platform:'node'});
 const {migrate}=await import('data:text/javascript;base64,'+Buffer.from(documentBundle.outputFiles[0].text).toString('base64'));
 const mock=createFetchMock();mock.disableNetConnect();
 mock.get('https://api.github.com').intercept({path:'/user'}).reply(200,{id:306061934}).persist();
 const env={EDITOR_ORIGIN:'https://miena1-a2.github.io',API_ORIGIN:'https://api.test',ALLOWED_USER_ID:'306061934',GITHUB_CLIENT_ID:'test',GITHUB_CLIENT_SECRET:'test',SESSION_KEY:'test-only-key'};
 // The pinned local workerd binary supports dates through 2026-05-22.
 // Production keeps its existing 2026-08-27 compatibility date.
 const mf=new Miniflare({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],bindings:env,kvNamespaces:['STORE'],durableObjects:{VISUAL:{className:'VisualStore',useSQLite:true}},fetchMock:mock});
 try{
  const kv=await mf.getKVNamespace('STORE'),token='b'.repeat(64),hash=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');
  await kv.put('session:'+hash,await seal({token:'test-github-token',expires:Date.now()+600000},env));
  const req=(path,body,auth=token,origin=env.EDITOR_ORIGIN)=>mf.dispatchFetch('https://api.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  assert.equal((await req('/v2/state',undefined,'')).status,401);
  assert.equal((await req('/v2/save',{},token,'https://evil.test')).status,403);
  let state=await (await req('/v2/state')).json();assert.equal(state.document,null);assert.equal(state.revision,0);
  const doc=migrate();doc.pages[0].sections[0].children[0].text='PRIVATE DRAFT';
  Object.assign(doc.pages[0].sections[0].children[0].box,{widthMode:'fill',maxWidth:600,anchor:'center',heightMode:'auto'});
  let response=await req('/v2/save',{document:doc,baseRevision:0,publish:false});assert.equal(response.status,200);assert.equal((await response.json()).revision,1);
  assert.equal((await (await req('/v2/published',undefined,'')).json()).document,null);
  state=await (await req('/v2/state')).json();assert.deepEqual(state.document,doc);
  doc.pages[0].sections[0].children[0].box.fontFamily='inter';
  doc.pages[0].sections[0].children[0].box.fontWeight=200;
  doc.pages[0].sections[0].children[0].overrides.mobile={fontFamily:'inter',fontWeight:800};
  const write=()=>req('/v2/save',{document:doc,baseRevision:1,publish:true});
  const concurrent=await Promise.all([write(),write()]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
  const publicState=await (await req('/v2/published',undefined,'')).json();assert.equal(publicState.revision,2);assert.deepEqual(publicState.document,doc);
  doc.pages[0].sections[0].children[0].text='NEXT PRIVATE DRAFT';
  response=await req('/v2/save',{document:doc,baseRevision:2,publish:false});assert.equal(response.status,200);
  assert.equal((await (await req('/v2/published',undefined,'')).json()).document.pages[0].sections[0].children[0].text,'PRIVATE DRAFT');
  const invalid=structuredClone(doc);invalid.pages[0].sections[0].children[0].src='https://evil.test';
  assert.equal((await req('/v2/save',{document:invalid,baseRevision:3,publish:true})).status,400);
  const invalidWeight=structuredClone(doc);invalidWeight.pages[0].sections[0].children[0].box.fontWeight=1000;
  assert.equal((await req('/v2/save',{document:invalidWeight,baseRevision:3,publish:true})).status,400);
  assert.equal((await req('/v2/unpublish',{baseRevision:2})).status,409);
  assert.equal((await req('/v2/unpublish',{baseRevision:3})).status,200);
  assert.equal((await (await req('/v2/published',undefined,'')).json()).document,null);
  state=await (await req('/v2/state')).json();assert.deepEqual(state.document,doc);assert.equal(state.revision,4);
  assert.equal((await req('/v2/save',{document:doc,baseRevision:3,publish:true})).status,409);
  // Embedded artwork is chunked without truncation (larger than one SQL row).
  doc.pages[0].sections[0].children[2].src='data:image/png;base64,'+'A'.repeat(2400000);
  assert.equal((await req('/v2/save',{document:doc,baseRevision:4,publish:true})).status,200);
  assert.deepEqual((await (await req('/v2/published',undefined,'')).json()).document,doc);
 }finally{await mf.dispose();await mock.close();}
});
