import {validContent} from '../app/content-schema.ts';
const REPO='MIENA1-A2/a-form-portfolio';
const FILE='app/site-content.json';
const enc=new TextEncoder();
class HttpError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status}}
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s))),b=>b.toString(16).padStart(2,'0')).join('')}
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const decode=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(env:Env){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode(env.SESSION_KEY)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function seal(value:unknown,env:Env){const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env),enc.encode(JSON.stringify(value)));return b64(iv)+'.'+b64(new Uint8Array(data));}
async function unseal(value:string,env:Env){const [iv,data]=value.split('.');return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv)},await key(env),decode(data))));}
export async function boundedJson(response:Response|Request,limit=65536):Promise<unknown>{
 const reader=response.body?.getReader();if(!reader)throw new HttpError(400,'缺少请求内容');const chunks:Uint8Array[]=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new HttpError(413,'内容过大');}chunks.push(value);}
 const data=new Uint8Array(size);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.byteLength;}
 try{return JSON.parse(new TextDecoder().decode(data))}catch{throw new HttpError(400,'JSON 格式无效')}
}
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
async function github(path:string,token:string,method='GET',body?:unknown){
 const response=await fetch('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'AForm-Studio','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new HttpError(response.status===409||response.status===422?409:502,response.status===409||response.status===422?'远程版本已更新，请重新加载后合并修改。':'GitHub 请求失败，请检查授权后重试。');
 return boundedJson(response,262144);
}
async function owner(token:string,env:Env){const user=await github('/user',token);if(!object(user)||String(user.id)!==env.ALLOWED_USER_ID)throw new HttpError(403,'仅作品集所有者可使用此编辑器');return user;}
async function readContent(token:string){const data=await github(`/repos/${REPO}/contents/${FILE}?ref=main`,token);if(!object(data)||typeof data.content!=='string'||typeof data.sha!=='string')throw new HttpError(502,'无法读取网站配置');const content:unknown=JSON.parse(new TextDecoder().decode(decode(data.content.replace(/\s/g,''))));if(!validContent(content))throw new HttpError(502,'网站配置格式不兼容');return {content,sha:data.sha};}
function cookie(req:Request,name:string){return req.headers.get('Cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(name+'='))?.slice(name.length+1)||'';}
function secureCookie(value:string,age:number){return `__Host-aform-state=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;}
async function handle(req:Request,env:Env):Promise<Response>{
 const url=new URL(req.url),origin=req.headers.get('Origin');
 if(url.pathname==='/v2/published'&&req.method==='GET')return Response.json(await env.VISUAL.getByName(env.ALLOWED_USER_ID).published());
 if(url.pathname==='/health')return Response.json({ready:!!(env.GITHUB_CLIENT_ID&&env.GITHUB_CLIENT_SECRET&&env.SESSION_KEY)});
 if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.SESSION_KEY)throw new HttpError(503,'安全登录尚未配置，请完成 GitHub OAuth 应用设置。');
 if(url.pathname==='/auth/start'&&req.method==='GET'){
  const state=random(),verifier=random();await env.STORE.put('oauth:'+await digest(state),verifier,{expirationTtl:600});
  const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(verifier)));const challenge=b64(hash).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const target=new URL('https://github.com/login/oauth/authorize');target.search=new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:env.API_ORIGIN+'/auth/callback',scope:'public_repo',state,code_challenge:challenge,code_challenge_method:'S256'}).toString();
  return new Response(null,{status:302,headers:{Location:target.toString(),'Set-Cookie':secureCookie(state,600)}});
 }
 if(url.pathname==='/auth/callback'&&req.method==='GET'){
  const state=url.searchParams.get('state')||'',code=url.searchParams.get('code')||'';
  const expected=cookie(req,'__Host-aform-state');
  if(!/^[a-f0-9]{64}$/.test(state)||!code||code.length>512||!expected||!crypto.subtle.timingSafeEqual(enc.encode(await digest(state)),enc.encode(await digest(expected))))throw new HttpError(403,'登录验证失败，请关闭窗口后重新登录。');
  const verifier=await env.STORE.get('oauth:'+await digest(state));if(!verifier)throw new HttpError(403,'登录已过期，请重试。');await env.STORE.delete('oauth:'+await digest(state));
  const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:env.API_ORIGIN+'/auth/callback',code_verifier:verifier}),signal:AbortSignal.timeout(15000)});
  const data=await boundedJson(response);if(!object(data)||typeof data.access_token!=='string')throw new HttpError(403,'GitHub 授权失败，请重试。');await owner(data.access_token,env);
  const session=random();await env.STORE.put('session:'+await digest(session),await seal({token:data.access_token,expires:Date.now()+3600000},env),{expirationTtl:3600});
  const nonce=random();const script=`window.opener?.postMessage(${JSON.stringify({type:'aform-auth',session})},${JSON.stringify(env.EDITOR_ORIGIN)});window.close();`;
  return new Response(`<!doctype html><meta charset="utf-8"><title>A / FORM 登录完成</title><p>登录成功，请返回编辑器。此窗口可以关闭。</p><script nonce="${nonce}">${script}</script>`,{headers:{'Content-Type':'text/html; charset=utf-8','Set-Cookie':secureCookie('',0),'Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'`}});
 }
 if(origin!==env.EDITOR_ORIGIN)throw new HttpError(403,'不允许的请求来源');
 if(req.method==='OPTIONS')return new Response(null,{status:204});
 if(!['GET','POST'].includes(req.method))throw new HttpError(405,'不支持的方法');
 const session=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';if(!/^[a-f0-9]{64}$/.test(session))throw new HttpError(401,'请先登录');
 const sessionKey='session:'+await digest(session),stored=await env.STORE.get(sessionKey);if(!stored)throw new HttpError(401,'登录已过期，请重新登录');
 const auth:unknown=await unseal(stored,env);if(!object(auth)||typeof auth.token!=='string'||typeof auth.expires!=='number'||auth.expires<Date.now())throw new HttpError(401,'登录已过期，请重新登录');
 if(url.pathname==='/logout'&&req.method==='POST'){await env.STORE.delete(sessionKey);return Response.json({ok:true});}
 // Check the GitHub identity on every content/draft/publish request, not just in the UI.
 await owner(auth.token,env);
 if(url.pathname==='/v2/state'&&req.method==='GET')return Response.json(await env.VISUAL.getByName(env.ALLOWED_USER_ID).state());
 if(['/v2/save','/v2/unpublish'].includes(url.pathname)&&req.method==='POST'){
  if(!req.headers.get('Content-Type')?.startsWith('application/json'))throw new HttpError(415,'需要 JSON 请求');
  const data=await boundedJson(req,17000000);
  if(!object(data)||!Number.isSafeInteger(data.baseRevision)||Number(data.baseRevision)<0)throw new HttpError(400,'版本号无效');
  const store=env.VISUAL.getByName(env.ALLOWED_USER_ID);
  if(url.pathname==='/v2/save'&&typeof data.publish!=='boolean')throw new HttpError(400,'发布选项无效');
  const result=url.pathname==='/v2/unpublish'?await store.unpublish(Number(data.baseRevision)):await store.save(JSON.stringify(data.document??null),Number(data.baseRevision),data.publish===true);
  if(result.error)throw new HttpError(result.status??500,result.error);
  return Response.json(result);
 }
 if(url.pathname==='/content'&&req.method==='GET')return Response.json(await readContent(auth.token));
 if(url.pathname==='/draft'&&req.method==='GET'){const draft=await env.STORE.get('draft:'+env.ALLOWED_USER_ID);return Response.json(draft?await unseal(draft,env):null);}
 if(req.method==='POST'&&['/draft','/publish'].includes(url.pathname)){
  if(!req.headers.get('Content-Type')?.startsWith('application/json'))throw new HttpError(415,'需要 JSON 请求');
  const data=await boundedJson(req);if(!object(data)||!validContent(data.content)||typeof data.sha!=='string'||! /^[a-f0-9]{40}$/.test(data.sha))throw new HttpError(400,'内容或版本号无效');
  if(url.pathname==='/draft'){await env.STORE.put('draft:'+env.ALLOWED_USER_ID,await seal({content:data.content,sha:data.sha,savedAt:new Date().toISOString()},env));return Response.json({ok:true});}
  const current=await readContent(auth.token);if(current.sha!==data.sha)throw new HttpError(409,'远程版本已更新，请先保存草稿，再重新登录加载最新版本后合并。');
  const result=await github(`/repos/${REPO}/contents/${FILE}`,auth.token,'PUT',{message:'Update portfolio from A FORM Studio',branch:'main',sha:data.sha,content:b64(enc.encode(JSON.stringify(data.content,null,2)+'\n'))});
  if(!object(result)||!object(result.content)||typeof result.content.sha!=='string')throw new HttpError(502,'无法确认同步结果，请查看 GitHub 发布进度');
  return Response.json({sha:result.content.sha});
 }
 throw new HttpError(404,'接口不存在');
}
export default {async fetch(req:Request,env:Env){
 let response:Response;try{response=await handle(req,env)}catch(error){const status=error instanceof HttpError?error.status:500;console.error(JSON.stringify({event:'studio_request_failed',status,path:new URL(req.url).pathname}));response=Response.json({error:error instanceof HttpError?error.message:'服务暂时不可用，请稍后重试'},{status});}
 const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('Referrer-Policy','no-referrer');headers.set('X-Content-Type-Options','nosniff');headers.set('Vary','Origin');
 if(req.headers.get('Origin')===env.EDITOR_ORIGIN){headers.set('Access-Control-Allow-Origin',env.EDITOR_ORIGIN);headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');headers.set('Access-Control-Allow-Headers','Authorization, Content-Type');}
 return new Response(response.body,{status:response.status,headers});
}} satisfies ExportedHandler<Env>;
