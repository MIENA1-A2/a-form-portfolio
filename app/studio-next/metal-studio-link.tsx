import {useRef} from 'react';
import {assetPath} from '../paths';
import source from './liquid-metal-source.html?raw';

// User-supplied liquid metal shader; only host geometry and input bridge differ.
const style='<style>html,body{background:transparent!important} .stage{--h:38px;--bw:112px;--pad:70px} .btn .ico,.btn .lbl{visibility:hidden} .plate{box-shadow:none}</style>';
const bridge=`<script>window.addEventListener('message',e=>{
 if(e.source!==parent||e.data?.type!=='studio-metal')return;
 const b=document.getElementById('btn'),r=b.getBoundingClientRect(),d=e.data;
 const init={pointerType:'mouse',clientX:r.left+r.width*(d.x??.5),clientY:r.top+r.height*(d.y??.5)};
 if(d.action==='enter')b.dispatchEvent(new PointerEvent('pointerenter',init));
 if(d.action==='leave')b.dispatchEvent(new PointerEvent('pointerleave',init));
 if(d.action==='move')window.dispatchEvent(new PointerEvent('pointermove',init));
 if(d.action==='down')b.dispatchEvent(new PointerEvent('pointerdown',init));
 if(d.action==='up')window.dispatchEvent(new PointerEvent('pointerup',init));
});</script>`;
const html=source.replace(/<link[^>]*>/g,'').replace('</head>',style+'</head>').replace('</body>',bridge+'</body>');
export default function MetalStudioLink(){
 const frame=useRef<HTMLIFrameElement>(null);
 const send=(action:string,x=.5,y=.5)=>frame.current?.contentWindow?.postMessage({type:'studio-metal',action,x,y},'*');
 return <a className="v2-nav-action v2-metal-action" href={assetPath('/studio-next/')}
  onPointerEnter={e=>{const r=e.currentTarget.getBoundingClientRect();send('enter',(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);}}
  onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();send('move',(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);}}
  onPointerLeave={()=>{send('leave');send('up');}} onPointerDown={()=>send('down')} onPointerUp={()=>send('up')} onPointerCancel={()=>{send('up');send('leave');}}
  onFocus={()=>send('enter')} onBlur={()=>send('leave')}>
  <iframe ref={frame} srcDoc={html} title="Liquid metal decoration" sandbox="allow-scripts" tabIndex={-1} aria-hidden="true" />
  <span>Open Studio</span>
 </a>;
}
