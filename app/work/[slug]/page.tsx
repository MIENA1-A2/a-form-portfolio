import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getProject,projects} from "../../data";
import ProjectDetail from "../../project-detail";
import Published from '../../studio-next/published';
import saved from "../../site-content.json";
import {assetPath,basePath,siteOrigin} from "../../paths";
type Props={params:Promise<{slug:string}>};
export const dynamicParams = false;
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const base=getProject((await params).slug);const edits=saved.projects as Record<string,Partial<import("../../data").Project>>;const p=base?{...base,...edits[base.slug]}:null;if(!p)return {title:"Project not found — A / FORM"};
 const url=siteOrigin+basePath+"/work/"+p.slug+"/";
 return {title:p.name+" — A / FORM",description:p.description,alternates:{canonical:url},openGraph:{title:p.name+" — A / FORM",description:p.description,url,images:[{url:assetPath(p.image),width:1536,height:1024,alt:p.alt}]},twitter:{card:"summary_large_image",title:p.name+" — A / FORM",description:p.description,images:[assetPath(p.image)]}};
}

export default async function ProjectPage({params}:Props){
 const project=getProject((await params).slug);if(!project)notFound();
 return <Published pageId={project.slug}><ProjectDetail slug={project.slug}/></Published>;
}
