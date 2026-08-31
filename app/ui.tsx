"use client";
import {useContent} from "./content";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {AnimatePresence,LayoutGroup,motion,useReducedMotion} from "motion/react";
import {createContext,useContext,useEffect,useState,type CSSProperties,type MouseEvent,type ReactNode} from "react";
import {profile,type Project} from "./data";
import {assetPath} from "./paths";

const NavigateContext=createContext<(e:MouseEvent<HTMLAnchorElement>,project:Project)=>void>(()=>{});
type Cover={project:Project;rect:{top:number;left:number;width:number;height:number};from:string};
export function PageShell({children}:{children:ReactNode}){
 const [cover,setCover]=useState<Cover|null>(null);const router=useRouter();const pathname=usePathname();const content=useContent();const preference=useReducedMotion();const reduced=preference||!content.motion.enabled;
 useEffect(()=>{if(!cover)return;const timeout=setTimeout(()=>setCover(null),8000);return()=>clearTimeout(timeout)},[cover]);
 useEffect(()=>{if(cover&&pathname!==cover.from){const t=setTimeout(()=>setCover(null),200);return()=>clearTimeout(t)}},[pathname,cover]);
 useEffect(()=>{if(pathname==="/"&&sessionStorage.getItem("aform-restore")==="yes"){sessionStorage.removeItem("aform-restore");const y=Number(sessionStorage.getItem("aform-scroll")||0);requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"instant"})));}},[pathname]);
 function navigate(e:MouseEvent<HTMLAnchorElement>,project:Project){
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(pathname==="/")sessionStorage.setItem("aform-scroll",String(window.scrollY));
  if(reduced)return;
  e.preventDefault();if(cover)return;
  const image=e.currentTarget.querySelector("img");const r=(image||e.currentTarget).getBoundingClientRect();
  setCover({project,rect:{top:r.top,left:r.left,width:r.width,height:r.height},from:pathname});
 }
 return <NavigateContext.Provider value={navigate}><LayoutGroup><a className="skip-link" href="#main-content">Skip to content</a>{children}<AnimatePresence>{cover&&<motion.div className="route-cover" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:.25}} aria-hidden="true"><motion.img src={assetPath(cover.project.image)} alt="" initial={cover.rect} animate={{top:0,left:0,width:"100vw",height:"100vh"}} transition={{duration:content.motion.duration,ease:[.22,1,.36,1]}} onAnimationComplete={()=>{if(pathname===cover.from)router.push("/work/"+cover.project.slug,{scroll:true})}}/></motion.div>}</AnimatePresence></LayoutGroup></NavigateContext.Provider>
}
export function ProjectLink({project,children,className="",style}:{project:Project;children:ReactNode;className?:string;style?:CSSProperties}){
 const navigate=useContext(NavigateContext);
 return <Link className={className} style={style} href={"/work/"+project.slug} onClick={e=>navigate(e,project)} aria-label={"View project: "+project.name}>{children}</Link>
}
export function BackLink(){return <Link className="back-link" href="/" onClick={()=>sessionStorage.setItem("aform-restore","yes")}>← BACK TO SELECTED WORK</Link>}
export function Navigation({dark=false}:{dark?:boolean}){
 return <header className={"nav "+(dark?"nav-dark":"")}><Link className="wordmark" href="/">{profile.name}<span>®</span></Link><nav aria-label="Main navigation"><Link href="/#work">WORK <sup>04</sup></Link><Link href="/#about">ABOUT</Link><Link href="/#contact">CONTACT ↗</Link></nav><span className="nav-location">INDEPENDENT PRACTICE<br/>{profile.location.toUpperCase()} — {profile.year}</span></header>
}
export function Reveal({children,className=""}:{children:ReactNode;className?:string}){
 const content=useContent();const preference=useReducedMotion();const reduced=preference||!content.motion.enabled;
 return <motion.div className={className} initial={false} whileInView={reduced?{opacity:1,y:0}:{opacity:[.25,1],y:[content.motion.distance,0]}} viewport={{once:true,amount:.12}} transition={{duration:reduced?0:content.motion.duration,ease:[.22,1,.36,1]}}>{children}</motion.div>
}
export function Footer(){
 const [time,setTime]=useState("SG — LOCAL TIME");useEffect(()=>{const update=()=>setTime(new Intl.DateTimeFormat("en-GB",{timeZone:profile.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date()));update();const id=setInterval(update,1000);return()=>clearInterval(id)},[]);
 return <footer className="footer"><span>© {profile.year} {profile.name}</span><span>DESIGN & DIRECTION<br/>AN INDEPENDENT EXPLORATION</span><span className="footer-clock">SINGAPORE<br/>{time}</span><a href="#top" aria-label="Back to top">↑</a></footer>
}
export function Artwork({project,variant=0,eager=false}:{project:Project;variant?:number;eager?:boolean}){
 return <div className={"artwork artwork-"+project.theme+" variant-"+variant}>
  <img src={assetPath(project.image)} alt={project.alt} width={1536} height={1024} loading={eager?"eager":"lazy"} decoding="async"/>
  <div className="artwork-top"><span>{variant===0?"A / FORM — STUDY "+project.number:project.category}</span><span>© {project.year}</span></div>
  <div className="artwork-type">{variant===1?project.statement:project.name.split(" ").map((word,i)=><span key={i}>{word}</span>)}</div>
  <div className="artwork-bottom"><span>{variant===2?"FORM / COLOUR / CONTEXT":"SELF-INITIATED — CONCEPT PROJECT"}</span><span>↗</span></div>
 </div>
}
