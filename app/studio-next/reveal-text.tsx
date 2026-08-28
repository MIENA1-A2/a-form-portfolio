'use client';
import {motion,useInView,useReducedMotion} from 'motion/react';
import {useRef} from 'react';
import type {MotionSpec} from './document';
import {lineDelay,revealLines} from './effects';
import './effects.css';

export default function RevealText({text,spec,align='left'}:{text:string;spec:MotionSpec;align?:'left'|'center'|'right'}){
 const ref=useRef<HTMLDivElement>(null),visible=useInView(ref,{once:true,amount:.1}),reduced=useReducedMotion();
 const lines=revealLines(text),active=spec.enter&&!reduced;
 const wipe=spec.reveal==='block-wipe';
 // A single accessible copy; visual line fragments must not be read twice.
 return <div ref={ref} className="fx-reveal-text"><span className="fx-accessible-text">{text}</span>
  {lines.map((line,i)=>{const delay=spec.delay+lineDelay(i,spec.stagger??.1),duration=spec.duration;
   return <span key={i} aria-hidden="true" className="fx-line" style={{minHeight:line?'1em':'1lh',marginLeft:align==='left'?0:'auto',marginRight:align==='right'?0:'auto'}}>
    <motion.span className="fx-line-words" initial={active?{opacity:0,y:wipe?0:'105%'}:false} animate={visible||!active?{opacity:1,y:0}:undefined} transition={active?{duration:wipe?0:duration,delay:delay+(wipe?duration*.48:0),ease:[.22,1,.36,1]}:{duration:0}}>{line||'\u00a0'}</motion.span>
    {wipe&&active&&<motion.span className="fx-wipe" style={{background:spec.coverColor??'#000000',transformOrigin:spec.direction==='right'?'right center':'left center'}} initial={{scaleX:0}} animate={visible?{scaleX:[0,1,1,0],transformOrigin:spec.direction==='right'?['right center','right center','left center','left center']:['left center','left center','right center','right center']}:undefined} transition={{duration,delay,times:[0,.42,.52,1],ease:[.76,0,.24,1]}}/>}
   </span>;
  })}
 </div>;
}
