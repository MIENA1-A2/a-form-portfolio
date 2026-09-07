import {assetPath} from '../paths';
import MetalStudioLink from './metal-studio-link';
import {useEffect,useState,useId} from 'react';
import {motion,useMotionValue,useReducedMotion,useSpring} from 'motion/react';
import type {Page} from './document';

export default function PublicNav({pages,pageId}:{pages:Page[];pageId:string}){
 const [compact,setCompact]=useState(false);
 const [hovered,setHovered]=useState(false);
 const reduceMotion=useReducedMotion();
 const glowX=useMotionValue(0),glowY=useMotionValue(0);
 const lightX=useSpring(glowX,{stiffness:65,damping:24,mass:1.2});
 const lightY=useSpring(glowY,{stiffness:65,damping:24,mass:1.2});
 const rimId=useId();
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
   if(!hovered){lightX.jump(event.clientX-rect.left);lightY.jump(event.clientY-rect.top);}
   glowX.set(event.clientX-rect.left);glowY.set(event.clientY-rect.top);
   setHovered(true);
  }} onPointerLeave={()=>setHovered(false)} onPointerCancel={()=>setHovered(false)}>
  <span className="v2-nav-blur" aria-hidden="true" />
  <motion.svg className="v2-nav-metal-rim" aria-hidden="true" initial={{opacity:0}} animate={{opacity:hovered&&!reduceMotion?1:0}} transition={{duration:.35}}>
   <defs><motion.radialGradient id={rimId} gradientUnits="userSpaceOnUse" cx={lightX} cy={lightY} r={180}><stop offset="0" stopColor="#fff"/><stop offset=".18" stopColor="#e4f5ff"/><stop offset=".36" stopColor="#6eb4ff" stopOpacity=".7"/><stop offset=".53" stopColor="#ffc373" stopOpacity=".45"/><stop offset=".76" stopColor="#ffc373" stopOpacity="0"/></motion.radialGradient></defs>
   <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="32" fill="none" stroke={`url(#${rimId})`} strokeWidth="1.5" />
  </motion.svg>
  <span className="v2-nav-glow-clip" aria-hidden="true"><motion.span className="v2-nav-glow-position" style={{x:lightX,y:lightY}} initial={{opacity:0}} animate={{opacity:hovered&&!reduceMotion?.6:0}} transition={{duration:.5}}><span className="v2-nav-glow" /></motion.span></span>
  <a className="v2-nav-brand" href={assetPath('/')} aria-label="A / FORM home">A / FORM</a>
  <nav aria-label="Portfolio pages">{pages.map(page=><a key={page.id} aria-current={page.id===pageId?'page':undefined} href={assetPath(page.id==='home'?'/':'/work/'+page.id+'/')}>{page.id==='home'?'Home':page.name.toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase())}</a>)}</nav>
  <MetalStudioLink />
 </header>;
}
