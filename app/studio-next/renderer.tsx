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
import SectionFrame from './section-frame';
import {resolveLayoutBox,safePadding} from './layout';
import RevealText from './reveal-text';
import Surface from './surface';
const Model=lazy(()=>import('./model'));
import type {CSSProperties,PointerEvent} from 'react';

export default function Renderer({page,bp,editing,selected,selectedIds=[selected],onSelect,onDrag,onText,onMarquee,marquee,canvasWidth=widths[bp],revision=0}:{page:Page;bp:Breakpoint;canvasWidth?:number;editing:boolean;selected:string;selectedIds?:string[];onSelect:(id:string,additive?:boolean)=>void;onMarquee?:(e:PointerEvent,sectionId:string)=>void;marquee?:{sectionId:string;x:number;y:number;width:number;height:number}|null;onDrag:(e:PointerEvent,id:string,resize?:boolean)=>void;onText:(id:string,text:string)=>void;revision?:number}){
 const reduced=useReducedMotion();
 return <div className="v2-page" style={{width:canvasWidth}}>{page.sections.map(section=><SectionFrame key={section.id} section={section} bp={bp} width={canvasWidth} editing={editing} onMarquee={onMarquee}><Surface value={section.surface}/>{section.children.filter(l=>!l.hidden).map(layer=>{
  const flow=section.layout!=='free',innerWidth=Math.max(1,canvasWidth-(flow?safePadding(section.padding,canvasWidth)*2:0)),b=resolveLayoutBox(layer,bp,innerWidth),autoText=layer.type==='text'&&b.heightMode==='auto';const style:CSSProperties={position:section.layout==='free'?'absolute':'relative',left:section.layout==='free'?b.x:undefined,top:section.layout==='free'?b.y:undefined,width:b.width,height:autoText?'auto':b.height,minHeight:autoText?b.fontSize*b.lineHeight:undefined,marginLeft:flow&&b.anchor!=='free'?b.x:undefined,flexShrink:0,color:b.color,fontSize:b.fontSize,lineHeight:b.lineHeight,letterSpacing:b.tracking+'em',textAlign:b.align,opacity:b.opacity,borderRadius:b.radius,transform:`rotate(${b.rotation}deg)`,...typographyAt(b),whiteSpace:'pre-wrap'};
  return <div key={layer.id} data-layer-id={layer.id} className={'v2-layer '+(editing&&selectedIds.includes(layer.id)?'is-selected':'')} style={style} onPointerDown={editing?e=>{e.stopPropagation();if((e.target as HTMLElement).closest('[contenteditable=true]'))return;onSelect(layer.id,e.shiftKey);if(!layer.locked&&!e.shiftKey)onDrag(e,layer.id);}:undefined}>
   {layer.type==='text'&&<Surface value={layer.surface}/>}
   <motion.div className="v2-layer-content" style={autoText?{height:'auto',overflow:'visible',overflowWrap:'anywhere'}:undefined} key={layer.type==='model'?'model':revision} initial={!editing&&!reduced&&layer.motion.enter&&!(layer.type==='text'&&layer.motion.reveal&&layer.motion.reveal!=='fade')?{opacity:0,y:layer.motion.distance}:false} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:reduced?0:layer.motion.duration,delay:layer.motion.delay}} whileHover={!editing&&!reduced?{scale:layer.motion.hover}:undefined}>
    {layer.type==='text'?(!editing&&layer.motion.reveal&&layer.motion.reveal!=='fade'?<RevealText text={layer.text} spec={layer.motion} align={b.align}/>:<EditableText text={layer.text} autoHeight={autoText} editable={editing&&selectedIds.length===1&&selected===layer.id&&!layer.locked} onCommit={text=>onText(layer.id,text)}/>):layer.type==='model'?<Suspense fallback={null}><Model spec={layer.model} src={layer.src} mobile={bp==='mobile'}/></Suspense>:<img src={layer.src.startsWith('/')?assetPath(layer.src):layer.src} width={b.width} height={b.height} draggable={false} alt={layer.alt} loading="lazy" style={{width:'100%',height:'100%',objectFit:b.fit,objectPosition:`${b.focalX}% ${b.focalY}%`,borderRadius:b.radius}}/>}
   </motion.div>
   {!editing&&layer.href&&<a href={assetPath(layer.href)} aria-label={layer.name||layer.alt||'View project'} style={{position:'absolute',inset:0,zIndex:3}}/>}
   {layer.type==='image'&&<Surface value={layer.surface} overlay/>}
   {editing&&selectedIds.includes(layer.id)&&<><span className="v2-selection-name">{layer.name}{layer.locked?' · 已锁定':''}</span>{!layer.locked&&selectedIds.length===1&&b.heightMode!=='auto'&&<button className="v2-resize" aria-label="调整图层尺寸" onPointerDown={e=>{e.stopPropagation();onDrag(e,layer.id,true)}}/>}</>}
  </div>;
 })}{editing&&marquee?.sectionId===section.id&&<div className="v2-marquee" style={{left:marquee.x,top:marquee.y,width:marquee.width,height:marquee.height}}/>}</SectionFrame>)}</div>;
}
