import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function mod(file,deps){const exports={};const code=ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInNewContext(code,{exports,require:key=>deps[key],structuredClone,console});return exports;}
const data=mod('../app/data.ts',{}),effects=mod('../app/studio-next/effects.ts',{});
const document=mod('../app/studio-next/document.ts',{'../data':data,'./effects':effects,'../site-content.json':JSON.parse(readFileSync(new URL('../app/site-content.json',import.meta.url)))});
test('injected failed persistence keeps last saved document and queue recovers',async()=>{
 let persisted=document.migrate(),fail=false;
 const draftStore=async(mode,value)=>{if(mode==='read')return persisted;if(fail){fail=false;throw Error('Injected storage failure');}persisted=structuredClone(value);};
 const local=mod('../app/studio-next/local-document.ts',{react:{},'./document':document,'./assets':{draftStore}});
 const initial=JSON.stringify(await local.loadDocument()),next=document.migrate();next.pages[0].sections[0].children[0].text='AFTER FAILURE';fail=true;
 await assert.rejects(local.saveDocument(next),/Injected/);assert.equal(JSON.stringify(persisted),initial);assert.equal(JSON.stringify(await local.loadDocument()),initial);
 await local.saveDocument(next);assert.equal(persisted.pages[0].sections[0].children[0].text,'AFTER FAILURE');
});
test('saving takes an immutable snapshot before asynchronous persistence',async()=>{
 let persisted=document.migrate();const local=mod('../app/studio-next/local-document.ts',{react:{},'./document':document,'./assets':{draftStore:async(mode,value)=>{if(mode==='read')return persisted;persisted=structuredClone(value);}}});
 const next=document.migrate();next.pages[0].sections[0].children[0].text='SNAPSHOT';const saved=local.saveDocument(next);next.pages[0].sections[0].children[0].text='LATER MUTATION';await saved;assert.equal(persisted.pages[0].sections[0].children[0].text,'SNAPSHOT');
});
test('invalid documents are rejected before persistence is called',async()=>{
 let writes=0;const local=mod('../app/studio-next/local-document.ts',{react:{},'./document':document,'./assets':{draftStore:async()=>{writes++;}}});
 await assert.rejects(local.saveDocument({version:0,pages:[]}));assert.equal(writes,0);
});
