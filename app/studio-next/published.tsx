'use client';
import {lazy,Suspense,useEffect,useRef,useState,type ReactNode} from 'react';
import {validDocument,widths,type Document,type Breakpoint} from './document';
import {assetPath} from '../paths';
import {Footer} from '../ui';
import './published.css';
const Renderer=lazy(()=>import('./renderer'));
const API='https://aform-studio-api.2975166565.workers.dev';
const noop=()=>{};
export default function Published({pageId,children}:{pageId:string;children:ReactNode}){
 const [doc,setDoc]=useState<Document|null>(null),[width,setWidth]=useState(1440);const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(new URLSearchParams(location.search).has('preview'))return;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  void fetch(API+'/v2/published',{cache:'no-store',signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('unavailable');const data:unknown=await response.json();if(data&&typeof data==='object'&&'document' in data&&validDocument(data.document))setDoc(data.document);}).catch(()=>{}).finally(()=>clearTimeout(timeout));
  return()=>{controller.abort();clearTimeout(timeout)};
 },[]);
 useEffect(()=>{if(!host.current)return;const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(host.current);return()=>observer.disconnect()},[doc]);
 const page=doc?.pages.find(p=>p.id===pageId);if(!page)return children;
 const bp:Breakpoint=width<600?'mobile':width<1100?'tablet':'desktop';
 return <div className="v2-public" ref={host} id="top" translate="no"><header className="v2-public-nav"><a href={assetPath('/')}>A / FORM</a><nav aria-label="Portfolio pages">{doc!.pages.map(p=><a key={p.id} aria-current={p.id===pageId?'page':undefined} href={assetPath(p.id==='home'?'/':'/work/'+p.id+'/')}>{p.id==='home'?'HOME':p.name}</a>)}</nav></header><main id="main-content" style={{zoom:width/widths[bp]}}><Suspense fallback={null}><Renderer page={page} bp={bp} editing={false} selected="" onSelect={noop} onDrag={noop} onText={noop}/></Suspense></main><Footer/></div>;
}
