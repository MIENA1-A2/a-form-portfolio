import {Suspense,lazy,useEffect,useRef,useState,type ReactNode} from 'react';
import {widths,type Breakpoint} from './document';
import {useLocalDocument} from './local-document';
import {assetPath} from '../paths';
import {Footer} from '../ui';
import './published.css';
const Renderer=lazy(()=>import('./renderer'));
const noop=()=>{};
import {cloudEnabled} from './deployment-mode';
import RemotePublished from './remote-published';
export default cloudEnabled?RemotePublished:Published;
function Published({pageId}:{pageId:string;children?:ReactNode}){
 const {doc,error}=useLocalDocument();const [width,setWidth]=useState(1440),host=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!host.current)return;const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(host.current);return()=>observer.disconnect()},[doc]);
 if(error)return <main role="alert">{error}</main>;
 if(!doc)return <main role="status">Loading your portfolio…</main>;
 const page=doc.pages.find(p=>p.id===pageId);if(!page)return <main>Page not found. <a href={assetPath('/')}>Return home</a></main>;
 const bp:Breakpoint=width<600?'mobile':width<1100?'tablet':'desktop';
 return <div className="v2-public" ref={host} id="top"><header className="v2-public-nav"><a href={assetPath('/')}>A / FORM</a><nav aria-label="Portfolio pages">{doc.pages.map(p=><a key={p.id} aria-current={p.id===pageId?'page':undefined} href={assetPath(p.id==='home'?'/':'/work/'+p.id+'/')}>{p.id==='home'?'HOME':p.name}</a>)}<a href={assetPath('/studio-next/')}>EDIT LOCAL COPY ↗</a></nav></header><main id="main-content" ><Suspense fallback={<p>Loading artwork…</p>}><Renderer page={page} bp={bp} canvasWidth={width} editing={false} selected="" onSelect={noop} onDrag={noop} onText={noop}/></Suspense></main><Footer/></div>;
}
