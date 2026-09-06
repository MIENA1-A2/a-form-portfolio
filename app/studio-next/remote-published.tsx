import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {migrate,type Breakpoint} from './document';
import {assetPath} from '../paths';
import {Footer} from '../ui';
const Renderer=lazy(()=>import('./renderer'));
import {refreshPublicDocument,type RefreshIssue} from './public-refresh';
const noop=()=>{};
export default function RemotePublished({pageId}:{pageId:string}){
 const [doc,setDoc]=useState(migrate),[issue,setIssue]=useState<RefreshIssue>(null),[attempt,setAttempt]=useState(0),[width,setWidth]=useState(1440),host=useRef<HTMLDivElement>(null);
 useEffect(()=>{let active=true;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);void refreshPublicDocument(migrate(),controller.signal).then(result=>{if(!active)return;setDoc(result.document);setIssue(result.issue);}).finally(()=>clearTimeout(timer));return()=>{active=false;controller.abort();clearTimeout(timer)}},[attempt]);
 useEffect(()=>{const element=host.current;if(!element)return;const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(element);return()=>observer.disconnect()},[doc]);
 const page=doc.pages.find(p=>p.id===pageId);if(!page)return <main>Page not found. <a href={assetPath('/')}>Home</a></main>;
 const bp:Breakpoint=width<600?'mobile':width<1100?'tablet':'desktop';
 return <div className="v2-public" ref={host} translate="no"><header className="v2-public-nav"><a href={assetPath('/')}>A / FORM</a><nav aria-label="Portfolio pages">{doc.pages.map(p=><a key={p.id} aria-current={p.id===pageId?'page':undefined} href={assetPath(p.id==='home'?'/':'/work/'+p.id+'/')}>{p.id==='home'?'HOME':p.name}</a>)}</nav></header>{issue&&<div role="status" style={{padding:'8px 18px',fontSize:12}}>Showing the bundled portfolio. Live updates are temporarily unavailable. <button onClick={()=>setAttempt(value=>value+1)}>Retry</button></div>}<main id="main-content"><Suspense fallback={<p>Loading artwork…</p>}><Renderer page={page} bp={bp} canvasWidth={width} editing={false} selected="" onSelect={noop} onDrag={noop} onText={noop}/></Suspense></main><Footer/></div>;
}
