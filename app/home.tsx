"use client";
import {motion,useReducedMotion} from "motion/react";
import type React from "react";
import {assetPath} from "./paths";
import {projects as baseProjects} from "./data";
import {useContent} from "./content";
import {Footer,ProjectLink,Reveal} from "./ui";
import "./frame-home.css";

const orbit=[[-34,-31,-18],[-12,-43,-7],[12,-43,7],[34,-31,18],[40,-3,24],[32,26,18],[10,39,6],[-12,39,-6],[-34,26,-18],[-40,-3,-24]];
const repeated=(length:number)=>Array.from({length},(_,i)=>i%4);

export default function HomeContent(){
 const content=useContent();const reduced=useReducedMotion()||!content.motion.enabled;
 const projects=baseProjects.map(p=>({...p,...content.projects[p.slug]}));
 const enter={initial:reduced?false:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.16},transition:{duration:reduced?0:content.motion.duration,ease:[.22,1,.36,1] as [number,number,number,number]}};
 return <main id="main-content" className="frame-home">
  <header className="frame-nav"><a className="frame-mark" href="#top" aria-label="A Form home">A/F</a><nav aria-label="Primary"><a href="#work">Work</a><a href="#about">About</a></nav><a className="frame-status" href="#contact">Available for ideas</a></header>
  <section className="frame-intro" id="top">
   <motion.h1 className="frame-title frame-title-left" initial={reduced?false:{opacity:0,y:-30}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.8,ease:[.22,1,.36,1]}}>A /</motion.h1>
   <motion.h1 className="frame-title frame-title-right" initial={reduced?false:{opacity:0,y:-30}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.8,delay:reduced?0:.08,ease:[.22,1,.36,1]}}>FORM<sup>®</sup></motion.h1>
   <div className="frame-discovery">THIS IS A SPACE FOR<br/>VISUAL DISCOVERY</div>
   <motion.div className="frame-portrait" initial={reduced?false:{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:reduced?0:1,delay:reduced?0:.15,ease:[.22,1,.36,1]}}><img src={assetPath(projects[0].image)} width="900" height="1200" alt={projects[0].alt}/><span>PHASE MATTER / STUDY 01</span></motion.div>
   <div className="frame-index"><div><b>INDEX</b><b>1/2</b></div><p>Four self-initiated studies in identity, image-making and digital direction. Each project turns a complex idea into a clear visual system.</p><a href="#work">[ EXPLORE WORK ]</a></div>
   <div className="frame-intro-about"><b>ABOUT A / FORM</b><p>An independent design practice exploring the space between clear systems and unexpected expression.</p></div>
   <a className="frame-menu" href="#work" aria-label="Explore selected work"><i/><i/><i/></a>
  </section>
  <section className="frame-orbit" id="work"><div className="orbit-center"><span>SELECTED</span><strong>WORK</strong><small>04 CONCEPT STUDIES</small></div>{orbit.map(([x,y,r],i)=>{const p=projects[i%4];return <ProjectLink project={p} className="orbit-card" key={i} style={{"--x":`${x}vw`,"--y":`${y}%`,"--r":`${r}deg`} as React.CSSProperties}><motion.img src={assetPath(p.image)} alt={i<4?p.alt:""} aria-hidden={i>=4} loading="lazy" width="720" height="540" whileHover={reduced?{}:{scale:1.04,rotate:0}} transition={{type:"spring",stiffness:260,damping:28}}/><span>{p.number}</span></ProjectLink>})}</section>
  <section className="frame-pause"><span>A SELECTION OF IDEAS MADE VISIBLE</span><span>SELF-INITIATED / CONCEPT PROJECTS</span></section>
  <section className="frame-rhythm"><motion.div {...enter} className="rhythm-copy"><span>RECENT WORKS</span><h2>HEY, CREATIVE<br/>DESIGN IS<br/>FOR THE FUTURE.</h2></motion.div><div className="rhythm-strip">{repeated(9).map((pi,i)=>{const p=projects[pi];return <ProjectLink project={p} key={i}><img src={assetPath(p.image)} alt={i<4?p.alt:""} aria-hidden={i>=4} loading="lazy" width="480" height="640"/><span>{String(i+1).padStart(2,"0")}</span></ProjectLink>})}</div></section>
  <section className="frame-scatter"><div className="scatter-copy"><span>EVERYTHING</span><strong>TO → CREATE</strong><span>ANYTHING</span></div>{projects.map((p,i)=><ProjectLink project={p} key={p.slug} className={`scatter-card scatter-${i+1}`}><motion.img src={assetPath(p.image)} alt={p.alt} loading="lazy" width="800" height="600" whileHover={reduced?{}:{scale:1.03}}/><span>{p.number} / {p.name}</span></ProjectLink>)}</section>
  <section className="frame-wall" aria-label="Project image wall"><div className="wall-grid">{repeated(15).map((pi,i)=>{const p=projects[pi];return <ProjectLink project={p} key={i} className={`wall-panel wall-panel-${i%5}`}><img src={assetPath(p.image)} alt={i<4?p.alt:""} aria-hidden={i>=4} loading="lazy" width="640" height="480"/><span>{p.number}</span></ProjectLink>})}</div></section>
  <section className="frame-editorial"><Reveal className="editorial-copy"><span>CREATIVE DESIGN</span><h2>WORK<br/>FOR<br/>A FUTURE.</h2><p>Four visual systems. One ongoing practice in making complex ideas feel immediate.</p></Reveal><div className="editorial-stack">{projects.map(p=><ProjectLink project={p} key={p.slug}><img src={assetPath(p.image)} alt={p.alt} loading="lazy" width="600" height="760"/><span>{p.number}</span></ProjectLink>)}</div></section>
  <section className="frame-systems"><motion.div {...enter} className="systems-title"><span>A / FORM</span><h2>CREATIVE<br/>SYSTEMS</h2></motion.div><div className="systems-grid">{repeated(6).map((pi,i)=>{const p=projects[pi];return <ProjectLink project={p} key={i}><img src={assetPath(p.image)} alt={i<4?p.alt:""} aria-hidden={i>=4} loading="lazy" width="720" height="520"/><span>{p.name} ↗</span><small>{p.category}</small></ProjectLink>})}</div><p className="systems-note">SELF-INITIATED / CONCEPT PROJECTS<br/>NO FICTIONAL CLIENT CLAIMS.</p></section>
  <section className="frame-about" id="about"><span>ABOUT THE PRACTICE</span><Reveal><h2 className="editable-lines">{content.text.aboutHeading}</h2></Reveal><div><p>{content.text.aboutBody}</p><p>{content.text.aboutSecond}</p></div></section>
  <section className="frame-cta"><motion.h2 {...enter}>STOP OVERTHINKING.<br/><span>MAKE THE IDEA</span><br/>VISIBLE.</motion.h2></section>
  <section className="frame-contact" id="contact"><span>DEMONSTRATION PORTFOLIO / CONTACT DETAILS COMING SOON</span><h2 className="editable-lines">{content.text.contactHeading}</h2><p className="editable-lines">{content.text.contactBody}</p></section>
  <Footer/>
 </main>
}
