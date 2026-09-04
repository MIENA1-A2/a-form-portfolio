"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import saved from "./site-content.json";
import {validContent,type SiteContent} from "./content-schema";
import {usePathname} from "./router";
export const initialContent:SiteContent=saved;
const Context=createContext<SiteContent>(initialContent);
export const useContent=()=>useContext(Context);
export function ContentProvider({children}:{children:ReactNode}){
 const [content,setContent]=useState(initialContent);const path=usePathname();
 useEffect(()=>{
  if(window.parent===window)return;
  function receive(e:MessageEvent){if(e.source!==window.parent||e.origin!==window.location.origin)return;if(e.data?.type==="aform-preview"&&validContent(e.data.content))setContent(e.data.content);if(e.data?.type==="aform-scroll"&&typeof e.data.id==="string")document.getElementById(e.data.id)?.scrollIntoView({behavior:"instant"});}
  window.addEventListener("message",receive);window.parent.postMessage({type:"aform-ready"},window.location.origin);
  return()=>window.removeEventListener("message",receive);
 },[path]);
 const d=content.design;const studio=path.startsWith("/studio");
 return <Context.Provider value={content}>{!studio&&<style>{`:root{--blue:${d.blue};--paper:${d.paper};--lime:${d.lime}}.hero-title{font-size:${12.65*d.headingScale}vw!important;letter-spacing:${d.tracking}em!important;line-height:${d.lineHeight}!important}.hero-title>span+span{font-size:${16.4*d.headingScale}vw!important}.about h2,.contact h2,.works-heading h2{letter-spacing:${d.tracking}em;line-height:${d.lineHeight}}.work-copy p,.works-intro p{font-size:${d.bodySize}px}.work{padding-bottom:${140*d.spacing}px}.about{padding-top:${120*d.spacing}px;padding-bottom:${120*d.spacing}px}.hero{background:linear-gradient(180deg,#000 0%,#000 37%,#091669 51%,${d.blue} 65%,#5b78ef 76%,#d8d8d6 94%)}.editable-lines{white-space:pre-line}@media(max-width:700px){.work{padding-bottom:${85*d.spacing}px}.hero-title>span+span{font-size:${17.2*d.headingScale}vw!important}}`}</style>}{children}</Context.Provider>;
}
