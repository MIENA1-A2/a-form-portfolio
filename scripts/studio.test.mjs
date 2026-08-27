import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import worker,{boundedJson,seal} from '../worker/index.ts';
import {validContent} from '../app/content-schema.ts';
const content=JSON.parse(await readFile(new URL('../app/site-content.json',import.meta.url),'utf8'));
test('strict content validation rejects injected CSS, routes, oversized text and invalid numbers',()=>{
 assert.ok(validContent(content));
 for(const mutate of [c=>c.design.blue='red;display:none',c=>c.motion.duration=Infinity,c=>c.projects['../../other']={},c=>c.projects['phase-matter']={image:'javascript:alert(1)'},c=>c.text.heroLine1='x'.repeat(2001),c=>c.text.heroLine1='',c=>c.design.extra=1]){const c=structuredClone(content);mutate(c);assert.equal(validContent(c),false);}
});
test('bounded parser rejects oversized bodies',async()=>{await assert.rejects(()=>boundedJson(new Response('x'.repeat(70000))),/内容过大/)});
test('worker fails closed without configuration',async()=>{const r=await worker.fetch(new Request('https://api.test/publish',{method:'POST'}),{});assert.equal(r.status,503)});
test('authentication, CORS, owner allowlist, conflict and constrained publication',async()=>{
 const values=new Map();const env={EDITOR_ORIGIN:'https://miena1-a2.github.io',API_ORIGIN:'https://api.test',ALLOWED_USER_ID:'306061934',GITHUB_CLIENT_ID:'test',GITHUB_CLIENT_SECRET:'test',SESSION_KEY:'test-only-not-a-production-key',STORE:{get:async k=>values.get(k)||null,put:async(k,v)=>values.set(k,v),delete:async k=>values.delete(k)}};
 const token='a'.repeat(64),hash=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');
 values.set('session:'+hash,await seal({token:'test-github-token',expires:Date.now()+60000},env));
 const req=(path,{origin=env.EDITOR_ORIGIN,auth=token,body,method=body?'POST':'GET'}={})=>new Request('https://api.test'+path,{method,headers:{Origin:origin,Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 assert.equal((await worker.fetch(req('/publish',{auth:'',body:{}}),env)).status,401);
 assert.equal((await worker.fetch(req('/content',{origin:'https://evil.test'}),env)).status,403);
 const preflight=await worker.fetch(req('/publish',{method:'OPTIONS',auth:''}),env);assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),env.EDITOR_ORIGIN);
 const realFetch=globalThis.fetch;let owner='wrong',write=null;
 globalThis.fetch=async(url,options)=>{if(url==='https://api.github.com/user')return Response.json({id:owner});assert.ok(url.startsWith('https://api.github.com/repos/MIENA1-A2/a-form-portfolio/contents/app/site-content.json'));if(options.method==='PUT'){write=JSON.parse(options.body);return Response.json({content:{sha:'c'.repeat(40)}})}return Response.json({sha:'b'.repeat(40),content:Buffer.from(JSON.stringify(content)).toString('base64')})};
 try{
  assert.equal((await worker.fetch(req('/content'),env)).status,403);owner='306061934';
  assert.equal((await worker.fetch(req('/content'),env)).status,200);
  assert.equal((await worker.fetch(req('/publish',{body:{content,sha:'a'.repeat(40)}}),env)).status,409);assert.equal(write,null);
  assert.equal((await worker.fetch(req('/draft',{body:{content,sha:'b'.repeat(40)}}),env)).status,200);assert.ok(!values.get('draft:306061934').includes('INDEPENDENT'));
  const draft=await worker.fetch(req('/draft'),env);assert.deepEqual((await draft.json()).content,content);
  assert.equal((await worker.fetch(req('/publish',{body:{content,sha:'b'.repeat(40)}}),env)).status,200);assert.equal(write.branch,'main');assert.equal(write.sha,'b'.repeat(40));assert.deepEqual(JSON.parse(Buffer.from(write.content,'base64')),content);
  assert.equal((await worker.fetch(req('/logout',{body:{}}),env)).status,200);assert.equal((await worker.fetch(req('/content'),env)).status,401);
 }finally{globalThis.fetch=realFetch;}
});
