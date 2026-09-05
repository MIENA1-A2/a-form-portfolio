import {useEffect,useState} from 'react';
import {migrate,validDocument,type Document} from './document';
import {draftStore} from './assets';
const listeners=new Set<(doc:Document)=>void>();
let current:Document|undefined;
let pending:Promise<Document>|undefined;
let queue=Promise.resolve();
const broadcast=typeof BroadcastChannel!=='undefined'?new BroadcastChannel(typeof location!=='undefined'&&location.pathname.includes('/preview/')?'aform-preview-document':'aform-rebuild-document'):null;
function receive(doc:unknown){if(!validDocument(doc))return;current=doc;for(const listener of listeners)listener(doc);}
broadcast?.addEventListener('message',event=>receive(event.data));
export function loadDocument(){
 if(current)return Promise.resolve(current);
 return pending??=(async()=>{const saved=await draftStore('read');current=validDocument(saved)?saved:migrate();return current;})().catch(error=>{pending=undefined;throw error;});
}
export function saveDocument(doc:Document){
 if(!validDocument(doc))return Promise.reject(Error('文档无效，未保存。'));
 const snapshot=structuredClone(doc);
 const task=queue.then(async()=>{await draftStore('write',snapshot);receive(snapshot);broadcast?.postMessage(snapshot);});
 queue=task.catch(()=>{});return task;
}
export function useLocalDocument(){
 const [doc,setDoc]=useState<Document|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;const listener=(value:Document)=>{if(active)setDoc(value)};listeners.add(listener);void loadDocument().then(listener).catch(()=>setError('无法读取副本草稿，请检查浏览器存储权限后刷新。'));return()=>{active=false;listeners.delete(listener)};},[]);
 return {doc,error};
}
