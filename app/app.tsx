import {lazy,Suspense,useEffect} from 'react';
import HomeContent from './home';
import ProjectDetail from './project-detail';
import Published from './studio-next/published';
import {ContentProvider} from './content';
import {getProject} from './data';
import {PageShell} from './ui';
import {usePathname} from './router';
import './globals.css';
import '@fontsource/inter/400.css';

const Workbench=lazy(()=>import('./studio-next/workbench'));
const Studio=lazy(()=>import('./studio/studio'));
function Route(){
 const path=usePathname();const slug=path.match(/^\/work\/([^/]+)$/)?.[1];const project=slug?getProject(slug):undefined;
 useEffect(()=>{document.title=project?`${project.name} — A / FORM`:path==='/studio-next'?'Visual Studio — A / FORM':path==='/studio'?'A / FORM — Studio':path==='/'?'A / FORM — Independent Designer':'Page not found — A / FORM';const hash=location.hash.slice(1);if(hash)requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView())},[path,project]);
 if(path==='/')return <Published pageId="home"><HomeContent/></Published>;
 if(project)return <Published pageId={project.slug}><ProjectDetail slug={project.slug}/></Published>;
 if(path==='/studio-next')return <Suspense fallback={<div className="app-loading">Opening Visual Studio…</div>}><Workbench/></Suspense>;
 if(path==='/studio')return <Suspense fallback={<div className="app-loading">Opening Studio…</div>}><Studio/></Suspense>;
 return <main className="not-found" id="main-content"><p>404</p><h1>THIS PAGE<br/>IS OUT OF FRAME.</h1><a href="./">RETURN HOME →</a></main>;
}
export default function App(){return <ContentProvider><PageShell><Route/></PageShell></ContentProvider>}
