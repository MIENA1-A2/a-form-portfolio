import {assetPath} from '../paths';
import MetalStudioLink from './metal-studio-link';
import {useEffect,useState} from 'react';
import {motion,useMotionValue,useReducedMotion,useSpring,useMotionTemplate} from 'motion/react';
import type {Page} from './document';

export default function PublicNav({pages,pageId}:{pages:Page[];pageId:string}){
 const [compact,setCompact]=useState(false);
 const [hovered,setHovered]=useState(false);
 const reduceMotion=useReducedMotion();
 const glowX=useMotionValue(0),glowY=useMotionValue(0);
 const lightX=useSpring(glowX,{stiffness:180,damping:28});
 const lightY=useSpring(glowY,{stiffness:180,damping:28});
 const rimLight=useMotionTemplate`radial-gradient(180px 90px at ${lightX}px ${lightY}px, #fff 0%, #e4f5ff 18%, rgba(110,180,255,.7) 36%, rgba(255,195,115,.45) 53%, transparent 76%)`;
 useEffect(()=>{
  const update=()=>setCompact(previous=>window.scrollY>(previous?24:64));
  update();
  window.addEventListener('scroll',update,{passive:true});
  return ()=>window.removeEventListener('scroll',update);
 },[]);
 return <header className={`v2-public-nav${compact?' is-compact':''}`}
  onPointerMove={event=>{
   if(event.pointerType!=='mouse'||reduceMotion)return;
   const rect=event.currentTarget.getBoundingClientRect();
   glowX.set(event.clientX-rect.left);glowY.set(event.clientY-rect.top);
   setHovered(true);
  }} onPointerLeave={()=>setHovered(false)} onPointerCancel={()=>setHovered(false)}>
  <span className="v2-nav-blur" aria-hidden="true" />
  <motion.span className="v2-nav-metal-rim" aria-hidden="true" style={{background:rimLight}} initial={{opacity:0}} animate={{opacity:hovered&&!reduceMotion?1:0}} transition={{duration:.35}} />
  <span className="v2-nav-glow-clip" aria-hidden="true"><motion.span className="v2-nav-glow" style={{x:lightX,y:lightY}} initial={{opacity:0}} animate={{opacity:hovered&&!reduceMotion?1:0}} transition={{duration:.35}} /></span>
  <a className="v2-nav-brand" href={assetPath('/')} aria-label="A / FORM home">A / FORM</a>
  <nav aria-label="Portfolio pages">{pages.map(page=><a key={page.id} aria-current={page.id===pageId?'page':undefined} href={assetPath(page.id==='home'?'/':'/work/'+page.id+'/')}>{page.id==='home'?'Home':page.name.toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase())}</a>)}</nav>
  <MetalStudioLink />
 </header>;
}
