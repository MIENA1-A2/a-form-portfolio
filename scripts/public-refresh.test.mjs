import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function mod(file,deps={}){const exports={};const source=ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInNewContext(source,{exports,require:key=>deps[key],console});return exports;}
const data=mod('../app/data.ts'),effects=mod('../app/studio-next/effects.ts');
const d=mod('../app/studio-next/document.ts',{'../data':data,'./effects':effects,'../site-content.json':JSON.parse(readFileSync(new URL('../app/site-content.json',import.meta.url)))});
const refresh=mod('../app/studio-next/public-refresh.ts',{'./document':d}).refreshPublicDocument;
const fallback=d.migrate(),signal=new AbortController().signal;
test('network failure keeps the bundled portfolio',async()=>{const r=await refresh(fallback,signal,async()=>{throw Error('offline')});assert.equal(r.document,fallback);assert.equal(r.issue,'network');});
test('HTTP errors and invalid responses do not blank the site',async()=>{for(const response of [{ok:false},{ok:true,json:async()=>({document:{}})},{ok:true,json:async()=>null},{ok:true,json:async()=>{throw Error('bad JSON')}}]){const r=await refresh(fallback,signal,async()=>response);assert.equal(r.document,fallback);assert.ok(r.issue);}});
test('empty public store uses built-in content without requiring login',async()=>{const r=await refresh(fallback,signal,async(url,options)=>{assert.ok(url.endsWith('/v2/published'));assert.equal(options.headers,undefined);return {ok:true,json:async()=>({document:null})}});assert.equal(r.document,fallback);assert.equal(r.issue,null);});
test('valid published content replaces the built-in portfolio',async()=>{const live=d.migrate();live.pages[0].sections[0].children[0].text='PUBLIC';const r=await refresh(fallback,signal,async()=>({ok:true,json:async()=>({document:live})}));assert.equal(r.document,live);assert.equal(r.issue,null);});
test('aborted request retains all five pages',async()=>{const controller=new AbortController();controller.abort();const r=await refresh(fallback,controller.signal,async(_,options)=>{if(options.signal.aborted)throw Error('timeout')});assert.equal(r.document.pages.length,5);assert.equal(r.issue,'network');});
test('public component starts with content and guards unmounted updates',()=>{const source=readFileSync(new URL('../app/studio-next/remote-published.tsx',import.meta.url),'utf8');assert.match(source,/useState\(migrate\)/);assert.match(source,/if\(!active\)return/);assert.doesNotMatch(source,/could not be loaded|useLocalDocument|draftStore/);});
