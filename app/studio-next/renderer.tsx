'use client';
import {motion,useReducedMotion} from 'motion/react';
import {assetPath} from '../paths';
import {boxAt,sectionHeight,widths,typographyAt,type Page,type Breakpoint} from './document';
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {lazy,Suspense} from 'react';
import EditableText from './editable-text';
import RevealText from './reveal-text';
import Surface from './surface';
const Model=lazy(()=>import('./model'));
import type {CSSProperties,PointerEvent} from 'react';

export default function Renderer({page,bp,editing,selected,onSelect,onDrag,onText,revision=0}:{page:Page;bp:Breakpoint;editing:boolean;selected:string;onSelect:(id:string)=>void;onDrag:(e:PointerEvent,id:string,resize?:boolean)=>void;onText:(id:string,text:string)=>void;revision?:number}){
 const reduced=useReducedMotion();
 return <div className="v2-page" style={{width:widths[bp]}}>{page.sections.map(section=><section key={section.id} style={{position:'relative',height:section.layout==='free'?sectionHeight(section,bp):undefined,minHeight:sectionHeight(section,bp),background:section.backgroundMode==='gradient'?`linear-gradient(180deg,#000 0%,#000 30%,${section.background} 68%,#d8d8d6 100%)`:section.background,overflow:'hidden',display:section.layout==='free'?'block':'flex',flexDirection:section.layout==='column'?'column':'row',gap:section.gap,padding:section.layout==='free'?0:section.padding,flexWrap:'wrap'}}><Surface value={section.surface}/>{section.children.filter(l=>!l.hidden).map(layer=>{
  const b=boxAt(layer,bp);const style:CSSProperties={position:section.layout==='free'?'absolute':'relative',left:section.layout==='free'?b.x:undefined,top:section.layout==='free'?b.y:undefined,width:b.width,height:b.height,flexShrink:0,color:b.color,fontSize:b.fontSize,lineHeight:b.lineHeight,letterSpacing:b.tracking+'em',textAlign:b.align,opacity:b.opacity,borderRadius:b.radius,transform:`rotate(${b.rotation}deg)`,...typographyAt(b),whiteSpace:'pre-wrap'};
  return <div key={layer.id} data-layer-id={layer.id} className={'v2-layer '+(editing&&selected===layer.id?'is-selected':'')} style={style} onPointerDown={editing?e=>{e.stopPropagation();onSelect(layer.id);if(!layer.locked)onDrag(e,layer.id);}:undefined}>
   {layer.type==='text'&&<Surface value={layer.surface}/>}
   <motion.div className="v2-layer-content" key={layer.type==='model'?'model':revision} initial={!editing&&!reduced&&layer.motion.enter&&!(layer.type==='text'&&layer.motion.reveal&&layer.motion.reveal!=='fade')?{opacity:0,y:layer.motion.distance}:false} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:reduced?0:layer.motion.duration,delay:layer.motion.delay}} whileHover={!editing&&!reduced?{scale:layer.motion.hover}:undefined}>
    {layer.type==='text'?(!editing&&layer.motion.reveal&&layer.motion.reveal!=='fade'?<RevealText text={layer.text} spec={layer.motion} align={b.align}/>:<EditableText text={layer.text} editable={editing&&selected===layer.id&&!layer.locked} onCommit={text=>onText(layer.id,text)}/>):layer.type==='model'?<Suspense fallback={null}><Model spec={layer.model} src={layer.src} mobile={bp==='mobile'}/></Suspense>:<img src={layer.src.startsWith('/')?assetPath(layer.src):layer.src} width={b.width} height={b.height} draggable={false} alt={layer.alt} loading="lazy" style={{width:'100%',height:'100%',objectFit:b.fit,objectPosition:`${b.focalX}% ${b.focalY}%`,borderRadius:b.radius}}/>}
   </motion.div>
   {layer.type==='image'&&<Surface value={layer.surface} overlay/>}
   {editing&&selected===layer.id&&<><span className="v2-selection-name">{layer.name}{layer.locked?' · 已锁定':''}</span>{!layer.locked&&<button className="v2-resize" aria-label="调整图层尺寸" onPointerDown={e=>{e.stopPropagation();onDrag(e,layer.id,true)}}/>}</>}
  </div>;
 })}</section>)}</div>;
}
