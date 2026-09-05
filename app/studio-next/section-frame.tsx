import {useLayoutEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';
import {safePadding} from './layout';
import {sectionHeight,widths,type Section,type Breakpoint} from './document';
export default function SectionFrame({section,bp,width,editing,onMarquee,children}:{section:Section;bp:Breakpoint;width:number;editing:boolean;onMarquee?:(e:PointerEvent,id:string)=>void;children:ReactNode}){
 const ref=useRef<HTMLElement>(null),[measured,setMeasured]=useState(0),free=section.layout==='free';
 useLayoutEffect(()=>{
  const host=ref.current;if(!host||!free)return;
  const measure=()=>{const bottom=Math.max(0,...Array.from(host.children).filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.hasAttribute('data-layer-id')).map(node=>node.offsetTop+node.offsetHeight));setMeasured(value=>Math.abs(value-bottom)<1?value:bottom);};
  const observer=new ResizeObserver(measure);observer.observe(host);for(const child of host.children)observer.observe(child);measure();return()=>observer.disconnect();
 },[children,free]);
 const ratio=width/widths[bp],base=free?sectionHeight(section,bp)*ratio:section.autoHeight?0:section.height*widths[bp]/1440*ratio;
 return <section ref={ref} data-section-id={section.id} onPointerDown={editing?e=>{if(e.target===e.currentTarget)onMarquee?.(e,section.id)}:undefined} style={{position:'relative',height:free?Math.max(base,measured):undefined,minHeight:base,background:section.backgroundMode==='gradient'?`linear-gradient(180deg,#000 0%,#000 30%,${section.background} 68%,#d8d8d6 100%)`:section.background,overflow:'hidden',display:free?'block':'flex',flexDirection:section.layout==='column'?'column':'row',gap:section.gap,padding:free?0:safePadding(section.padding,width),flexWrap:section.layout==='column'?'nowrap':'wrap',alignItems:'flex-start'}}>{children}</section>;
}
