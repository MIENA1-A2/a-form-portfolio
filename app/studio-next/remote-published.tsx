import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {migrate,validDocument,type Document,type Breakpoint} from './document';
import {assetPath} from '../paths';
import {Footer} from '../ui';
const Renderer=lazy(()=>import('./renderer'));
const API='https://aform-studio-api.2975166565.workers.dev';
const noop=()=>{};
export default function RemotePublished({pageId}:{pageId:string}){
 const [doc,setDoc]=useState<Document|null>(null),[error,setError]=useState(false),[width,setWidth]=useState(1440),host=useRef<HTMLDivElement>(null);
 useEffect(()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);void fetch(API+'/v2/published',{cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('unavailable');const data=await r.json();if(!data||typeof data!=='object'||!('document' in data))throw Error('Invalid response');if(data.document===null)setDoc(migrate());else if(validDocument(data.document))setDoc(data.document);else throw Error('Invalid document');}).catch(()=>{if(!controller.signal.aborted||!doc)setError(true)}).finally(()=>clearTimeout(timer));return()=>{controller.abort();clearTimeout(timer)}},[]);
 useEffect(()=>{const element=host.current;if(!element)return;const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(element);return()=>observer.disconnect()},[doc]);
 if(error&&!doc)return <main role="alert">The portfolio could not be loaded. Please refresh to try again.</main>;
 if(!doc)return <main role="status">Loading portfolio…</main>;
 const page=doc.pages.find(p=>p.id===pageId);if(!page)return <main>Page not found. <a href={assetPath('/')}>Home</a></main>;
 const bp:Breakpoint=width<600?'mobile':width<1100?'tablet':'desktop';
 return <div className="v2-public" ref={host} translate="no"><header className="v2-public-nav"><a href={assetPath('/')}>A / FORM</a><nav aria-label="Portfolio pages">{doc.pages.map(p=><a key={p.id} aria-current={p.id===pageId?'page':undefined} href={assetPath(p.id==='home'?'/':'/work/'+p.id+'/')}>{p.id==='home'?'HOME':p.name}</a>)}</nav></header><main id="main-content"><Suspense fallback={<p>Loading artwork…</p>}><Renderer page={page} bp={bp} canvasWidth={width} editing={false} selected="" onSelect={noop} onDrag={noop} onText={noop}/></Suspense></main><Footer/></div>;
}
