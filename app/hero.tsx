"use client";
import {Component,Suspense,lazy,useCallback,useEffect,useRef,useState,type ReactNode} from "react";
import {motion,useInView,useReducedMotion,useScroll,useTransform} from "motion/react";
import {Navigation} from "./ui";
import {assetPath} from "./paths";
const Sculpture=lazy(()=>import("./sculpture"));
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(){this.props.onFailure()}
 render(){return this.state.failed?null:this.props.children}
}
export default function Hero(){
 const ref=useRef<HTMLElement>(null);const inView=useInView(ref);const reduced=useReducedMotion();
 const [enabled,setEnabled]=useState(false);const [ready,setReady]=useState(false);const [visible,setVisible]=useState(true);
 const {scrollYProgress}=useScroll({target:ref,offset:["start start","end start"]});
 const objectY=useTransform(scrollYProgress,[0,1],[0,-100]);const textY=useTransform(scrollYProgress,[0,1],[0,-35]);
 const onReady=useCallback(()=>setReady(true),[]);const onFailure=useCallback(()=>{setEnabled(false);setReady(false)},[]);
 useEffect(()=>{
  const query=window.matchMedia("(min-width: 900px) and (pointer: fine)");
  const update=()=>{let supported=false;try{const c=document.createElement("canvas");const gl=c.getContext("webgl2");supported=!!gl;gl?.getExtension("WEBGL_lose_context")?.loseContext()}catch{}setEnabled(query.matches&&!reduced&&supported)};
  update();query.addEventListener("change",update);
  const visibility=()=>setVisible(!document.hidden);document.addEventListener("visibilitychange",visibility);
  return()=>{query.removeEventListener("change",update);document.removeEventListener("visibilitychange",visibility)};
 },[reduced]);
 return <section className="hero" id="top" ref={ref}>
  <Navigation/>
  <div className="hero-note"><span className="cross">+</span> VISUAL IDENTITIES.<br/>UNEXPECTED PERSPECTIVES.</div>
  <motion.h1 className="hero-title" style={{y:reduced?0:textY}}><span>INDEPENDENT</span><span>DESIGNER<span className="title-star">✳</span></span></motion.h1>
  <motion.div className={enabled&&ready?"hero-sculpture":"hero-sculpture static-sculpture"} style={{y:reduced?0:objectY}} aria-hidden="true">
   <img className={enabled&&ready?"sculpture-fallback is-ready":"sculpture-fallback"} src={assetPath("/images/hero-final.png")} alt="" width="1254" height="1254" fetchPriority="high"/>
   {enabled&&<SceneBoundary onFailure={onFailure}><Suspense fallback={null}><Sculpture active={inView&&visible} onReady={onReady} onFailure={onFailure}/></Suspense></SceneBoundary>}
  </motion.div>
  <span className="hero-object-label">FIG. A — A STUDY IN FORM</span>
  <div className="hero-caption"><span>FORM IS A LANGUAGE.<br/>LET’S MAKE IT SAY SOMETHING.</span><a href="#work">EXPLORE SELECTED WORK <span>↓</span></a></div>
  <div className="hero-bottom"><span>BRAND IDENTITY / ART DIRECTION / DIGITAL EXPERIENCE</span><span>1°17′ N &nbsp; 103°51′ E</span><span>SCROLL TO DISCOVER ↓</span></div>
 </section>
}
