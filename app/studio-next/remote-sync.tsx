'use client';
import {useEffect,useRef,useState} from 'react';
import {validDocument,type Document} from './document';
import {assetPath} from '../paths';
export const STUDIO_API='https://aform-studio-api.2975166565.workers.dev';
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object';
type CloudState={document:Document|null;revision:number;publishedRevision:number;updated:string};
const validState=(v:unknown):v is CloudState=>object(v)&&(v.document===null||validDocument(v.document))&&Number.isSafeInteger(v.revision)&&Number(v.revision)>=0&&Number.isSafeInteger(v.publishedRevision)&&typeof v.updated==='string';
async function request(path:string,session:string,body?:unknown){
 const response=await fetch(STUDIO_API+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+session,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(30000)});
 const data:unknown=await response.json();
 if(!response.ok)throw Error(object(data)&&typeof data.error==='string'?data.error:'连接失败，请重试。');
 return data;
}
export default function CloudSync({doc,dirty,blocked,onLoad,onSaved}:{doc:Document;dirty:boolean;blocked:boolean;onLoad:(doc:Document)=>void;onSaved:(doc:Document)=>void}){
 const [session,setSession]=useState(''),[version,setVersion]=useState<number|null>(null),[published,setPublished]=useState(0),[auto,setAuto]=useState(false),[paused,setPaused]=useState(false),[working,setWorking]=useState(false),[message,setMessage]=useState('登录后自动保存云端草稿；未开启自动更新时，不改变公开网站。'),[pending,setPending]=useState<CloudState|null>(null);
 const popup=useRef<Window|null>(null),saved=useRef(''),inFlight=useRef(false),epoch=useRef(0),latest=useRef({doc,dirty,blocked,onLoad,onSaved});
 useEffect(()=>{latest.current={doc,dirty,blocked,onLoad,onSaved};});
 const serialized=JSON.stringify(doc);
 function apply(state:CloudState){
  setVersion(state.revision);setPublished(state.publishedRevision);setPending(null);setPaused(false);
  if(state.document){saved.current=JSON.stringify(state.document);latest.current.onLoad(state.document);}else saved.current='';
  setMessage(state.document?'已加载云端草稿 · 修改后自动保存':'云端暂无草稿 · 正在保存当前画布');
 }
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{
   if(event.origin!==STUDIO_API||event.source!==popup.current||event.data?.type!=='aform-auth'||typeof event.data.session!=='string'||! /^[a-f0-9]{64}$/.test(event.data.session))return;
   popup.current?.close();popup.current=null;const token=event.data.session,id=++epoch.current;
   setSession(token);setVersion(null);setAuto(false);setWorking(true);inFlight.current=true;
   void request('/v2/state',token).then(data=>{
    if(id!==epoch.current)return;if(!validState(data))throw Error('云端文档格式不兼容。');
    if(data.document&&latest.current.dirty){setPending(data);setPaused(true);setMessage('本机有未同步修改，请选择保留哪一版。');}else apply(data);
   }).catch(error=>{if(id===epoch.current){setPaused(true);setMessage(error.message);}}).finally(()=>{if(id===epoch.current){inFlight.current=false;setWorking(false);}});
  };
  window.addEventListener('message',receive);return()=>{window.removeEventListener('message',receive);epoch.current++;};
 },[]);
 async function save(publish:boolean){
  if(!session||version===null||inFlight.current||latest.current.blocked)return;
  const snapshot=latest.current.doc,body=JSON.stringify(snapshot),id=epoch.current;
  if(!validDocument(snapshot)){setPaused(true);setMessage('画布内容无效，请修正后重试。');return;}
  inFlight.current=true;setWorking(true);setMessage(publish?'正在保存并更新公开网站…':'正在保存云端草稿…');
  try{
   const result=await request('/v2/save',session,{document:snapshot,baseRevision:version,publish});
   if(id!==epoch.current)return;
   if(!object(result)||!Number.isSafeInteger(result.revision)||!Number.isSafeInteger(result.publishedRevision))throw Error('无法确认保存结果，请重新加载云端。');
   saved.current=body;setVersion(Number(result.revision));setPublished(Number(result.publishedRevision));setPaused(false);latest.current.onSaved(snapshot);
   setMessage(publish?'已发布 · 访客打开或刷新作品集即可看到':'云端草稿已保存 · 其他设备登录后可继续');
  }catch(error){if(id===epoch.current){setPaused(true);setAuto(false);setMessage((error instanceof Error?error.message:'保存失败')+' 本机内容已保留，自动更新已暂停。');}}
  finally{if(id===epoch.current){inFlight.current=false;setWorking(false);}}
 }
 useEffect(()=>{
  if(!session||version===null||paused||blocked||working)return;
  if(serialized===saved.current&&(!auto||published===version))return;
  const timer=setTimeout(()=>void save(auto),3000);return()=>clearTimeout(timer);
 // Each completed save advances the revision; edits during a request schedule the next save.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[serialized,session,version,published,auto,paused,blocked,working]);
 async function reload(){
  if(!session||inFlight.current)return;const id=epoch.current;inFlight.current=true;setWorking(true);setAuto(false);
  try{const data=await request('/v2/state',session);if(id!==epoch.current)return;if(!validState(data))throw Error('云端内容格式不兼容');if(JSON.stringify(latest.current.doc)!==saved.current&&data.document){setPending(data);setPaused(true);setMessage('云端与本机不同，请选择版本。');}else apply(data);}
  catch(error){if(id===epoch.current)setMessage(error instanceof Error?error.message:'读取失败');}finally{if(id===epoch.current){inFlight.current=false;setWorking(false);}}
 }
 // Poll only while the local draft is clean; never replace edits made during a fetch.
 useEffect(()=>{
  if(!session||version===null||paused)return;
  const timer=setInterval(()=>{
   if(inFlight.current||latest.current.blocked||JSON.stringify(latest.current.doc)!==saved.current||document.visibilityState!=='visible')return;
   const id=epoch.current;inFlight.current=true;setWorking(true);
   void request('/v2/state',session).then(data=>{
    if(id!==epoch.current||!validState(data)||data.revision===version)return;
    if(JSON.stringify(latest.current.doc)!==saved.current){setPaused(true);setAuto(false);setPending(data);setMessage('另一台设备已修改，请处理版本冲突。');}
    else {setAuto(false);apply(data);}
   }).catch(()=>{}).finally(()=>{if(id===epoch.current){inFlight.current=false;setWorking(false);}});
  },20000);return()=>clearInterval(timer);
 },[session,version,paused]);
 async function original(){
  if(!session||version===null||inFlight.current||!confirm('切回原作品集？新版云端草稿会保留，自动更新将关闭。'))return;
  setAuto(false);inFlight.current=true;setWorking(true);const id=epoch.current;
  try{const result=await request('/v2/unpublish',session,{baseRevision:version});if(id!==epoch.current)return;if(!object(result)||!Number.isSafeInteger(result.revision))throw Error('无法确认操作');setVersion(Number(result.revision));setPublished(0);setMessage('已切回原作品集，新版草稿仍保留。');}
  catch(error){setPaused(true);setMessage(error instanceof Error?error.message:'操作失败');}finally{inFlight.current=false;setWorking(false);}
 }
 return <section className="v2-cloud" aria-label="云端同步"><div className="v2-cloud-actions">{!session?<button className="v2-primary" onClick={()=>{popup.current=window.open(STUDIO_API+'/auth/start','aform-v2-login','width=640,height=760');if(!popup.current)setMessage('请允许弹出登录窗口。');}}>GitHub 登录 · 云端同步 ↗</button>:<><button disabled={working} onClick={()=>{epoch.current++;void request('/logout',session,{}).catch(()=>{});setSession('');setVersion(null);setAuto(false);setPending(null);inFlight.current=false;setMessage('已退出 · 本机画布保留。');}}>退出登录</button><button disabled={working} onClick={()=>void reload()}>加载云端</button><button disabled={working||version===null||!!pending||blocked} onClick={()=>void save(false)}>保存云端</button><button disabled={working||version===null||!!pending||blocked} onClick={()=>{if(confirm('将当前五个页面发布为公开作品集？图片、文字与排版都会公开，并替换原版页面。'))void save(true);}}>发布当前画布 ↗</button><label><input type="checkbox" checked={auto} disabled={working||version===null||!!pending||blocked} onChange={event=>{if(!event.target.checked){setAuto(false);return;}if(confirm('开启后，每次停止编辑约 3 秒就会公开当前画布。初次发布会替换原作品集排版。确定开启？')){setPaused(false);setAuto(true);}}}/>自动更新线上</label>{published>0&&<button disabled={working} onClick={()=>void original()}>切回原作品集</button>}</>}<a href={assetPath('/')} target="_blank" rel="noreferrer">查看线上 ↗</a></div><p role="status">{working?'处理中… ':''}{message}</p>{pending&&<div className="v2-cloud-conflict"><b>版本选择（建议先“导出备份”）</b><button onClick={()=>{if(confirm('用云端版本替换当前画布？本机版本可通过撤销恢复，建议先导出。'))apply(pending);}}>采用云端版本</button><button onClick={()=>{if(confirm('以当前本机画布覆盖刚加载的云端草稿？其他设备更新的内容可能被替换。')){setVersion(pending.revision);setPublished(pending.publishedRevision);saved.current='';setPending(null);setPaused(false);setMessage('采用本机画布，准备保存云端。');}}}>采用本机版本</button></div>}</section>;
}
