"use client";
import {motion,useReducedMotion} from "motion/react";
import Hero from "./hero";
import {assetPath} from "./paths";
import {projects,profile,type Project} from "./data";
import {Artwork,Footer,ProjectLink,Reveal} from "./ui";
function Work({project}:{project:Project}){
 const reduced=useReducedMotion();
 return <section className={"work work-"+project.theme} id={project.slug}>
  <div className="work-meta"><span>({project.number})</span><span>{project.category}</span><span>{project.year}</span></div>
  <ProjectLink project={project} className="work-image">
   <motion.div initial={false} whileInView={reduced?{}:{clipPath:["inset(8% 0 8% 0)","inset(0% 0 0% 0)"]}} viewport={{once:true,amount:.15}} whileHover={reduced?{}:{scale:1.02}} transition={{duration:.7,ease:[.22,1,.36,1]}}><Artwork project={project}/></motion.div>
   <span className="view-label">VIEW PROJECT ↗</span>
  </ProjectLink>
  <Reveal className="work-copy"><span className="eyebrow">SELF-INITIATED / CONCEPT PROJECT</span><ProjectLink project={project}><h3>{project.name.split(" ").map(w=><span key={w}>{w}</span>)}<span className="work-arrow">↗</span></h3></ProjectLink><p>{project.description}</p><div className="work-role">{project.role}<br/>{project.year}</div></Reveal>
  {project.theme==="common"&&<div className="common-secondary"><Artwork project={project} variant={1}/><span className="giant-number" aria-hidden="true">04</span></div>}
 </section>
}
export default function HomeContent(){
 return <main id="main-content"><Hero/>
  <section className="works-intro" id="work"><div className="eyebrow">A SELECTION OF IDEAS MADE VISIBLE <span>2026 EDITION</span></div><Reveal className="works-heading"><h2>SELECTED<br/>WORKS<span>(04)</span></h2></Reveal><p>Independent explorations at the intersection<br/>of culture, material and visual systems.</p><div className="index-list">{projects.map(p=><a href={"#"+p.slug} key={p.slug}><span>{p.number} — {p.category}</span><span>↗</span></a>)}</div></section>
  <Work project={projects[0]}/><Work project={projects[1]}/>
  <section className="manifesto"><span className="eyebrow">A SIMPLE BELIEF</span><Reveal><h2>FORM<br/>FOLLOWS<br/><span>IDEA.</span></h2></Reveal><span className="manifesto-caption">NOT THE OTHER WAY AROUND.</span><span className="manifesto-plus" aria-hidden="true">+</span></section>
  <Work project={projects[2]}/><Work project={projects[3]}/>
  <section className="experimental"><div className="experiment-top"><span>ONGOING EXPLORATIONS</span><span>FORM STUDY — 005</span></div><div className="experimental-object"><img src={assetPath("/images/hero-final.png")} width="1024" height="1024" loading="lazy" alt="A reflective organic sculpture recoloured as an experimental yellow-green form"/></div><Reveal className="experimental-type"><h2>FORM<br/><span>MEETS</span><br/>SYSTEM.</h2></Reveal><p>Structure gives an idea clarity.<br/>Experimentation gives it a pulse.</p></section>
  <section className="about" id="about"><div className="eyebrow">A / FORM — THE PRACTICE <span>INDEPENDENT BY DESIGN</span></div><Reveal><h2>I CREATE<br/>VISUAL SYSTEMS<br/>FOR BRANDS<br/>AND <span>CULTURE.</span></h2></Reveal><div className="about-description"><span className="about-symbol" aria-hidden="true">a/f</span><div><p>{profile.description}</p><p>From the first question to the final detail, I build identities that feel considered, distinctive and alive.</p><span className="concept-note">A fictional practice. Real curiosity.<br/>All projects shown are self-initiated concept studies.</span></div></div><dl className="profile"><div><dt>LOCATION</dt><dd>{profile.location}</dd></div><div><dt>FOCUS</dt><dd>Brand identity<br/>Art direction<br/>Digital experience</dd></div><div><dt>PRACTICE</dt><dd>Independent<br/>Concept studies / 2026</dd></div><div><dt>CONTACT</dt><dd>Details coming soon<br/><span>Demonstration portfolio</span></dd></div></dl></section>
  <section className="contact" id="contact"><div className="eyebrow">GOOD THINGS BEGIN WITH A CONVERSATION <span>LET’S FIND THE UNEXPECTED.</span></div><Reveal><h2>LET’S CREATE<br/>SOMETHING<span className="contact-arrow">↗</span><span className="contact-period">.</span></h2></Reveal><div className="contact-bottom"><p>This is a concept portfolio.<br/>Contact channels will be added with the real designer’s details.</p><div className="contact-channels" aria-label="Contact channels are not yet available"><span>EMAIL <sup>SOON</sup></span><span>INSTAGRAM <sup>SOON</sup></span><span>BEHANCE <sup>SOON</sup></span><span>LINKEDIN <sup>SOON</sup></span></div></div></section>
  <Footer/>
 </main>
}
