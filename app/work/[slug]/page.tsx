import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getProject,projects} from "../../data";
import {Artwork,BackLink,Footer,Navigation,ProjectLink,Reveal} from "../../ui";
import {assetPath,basePath,siteOrigin} from "../../paths";
type Props={params:Promise<{slug:string}>};
export const dynamicParams = false;
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const p=getProject((await params).slug);if(!p)return {title:"Project not found — A / FORM"};
 const url=siteOrigin+basePath+"/work/"+p.slug+"/";
 return {title:p.name+" — A / FORM",description:p.description,alternates:{canonical:url},openGraph:{title:p.name+" — A / FORM",description:p.description,url,images:[{url:assetPath(p.image),width:1536,height:1024,alt:p.alt}]},twitter:{card:"summary_large_image",title:p.name+" — A / FORM",description:p.description,images:[assetPath(p.image)]}};
}
export default async function ProjectPage({params}:Props){
 const project=getProject((await params).slug);if(!project)notFound();const next=projects[(projects.indexOf(project)+1)%projects.length];
 return <main className={"project-detail detail-"+project.theme} id="main-content"><div id="top"/><Navigation dark/>
  <div className="detail-heading"><BackLink/><div className="detail-topline"><span>PROJECT {project.number} / 04</span><span>SELF-INITIATED / CONCEPT PROJECT</span></div><h1>{project.name}</h1><div className="detail-info"><p>{project.description}</p><dl><div><dt>DISCIPLINE</dt><dd>{project.category}</dd></div><div><dt>ROLE</dt><dd>{project.role}</dd></div><div><dt>YEAR</dt><dd>{project.year}</dd></div></dl></div></div>
  <div className="detail-main-art"><Artwork project={project} eager/></div>
  <Reveal className="detail-narrative"><span className="eyebrow">THE IDEA</span><p>{project.narrative}</p></Reveal>
  <section className="detail-study"><Artwork project={project} variant={1}/><div className="study-caption"><span>02 / EXPRESSION</span><p>One idea. A flexible visual language.</p></div></section>
  <section className="detail-pair"><Artwork project={project} variant={2}/><div className={"specimen specimen-"+project.theme}><span>03 / SYSTEM</span><h2>{project.statement}</h2><div className="specimen-rule"/><span>{project.name}<br/>A / FORM — 2026</span><span className="specimen-type">Aa<br/>0123</span></div></section>
  <section className="next-project"><span className="eyebrow">CONTINUE EXPLORING — NEXT PROJECT</span><ProjectLink project={next}><h2>{next.name} ↗</h2></ProjectLink><BackLink/></section><Footer/>
 </main>
}
