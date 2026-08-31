import { projects } from '../data';
import saved from '../site-content.json';
import {validReveal,validSurface,type RevealOptions,type Surface} from './effects';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export type Box = { x:number;y:number;width:number;height:number;fontSize:number;fontWeight?:number;fontFamily?:'arial'|'inter';lineHeight:number;tracking:number;rotation:number;opacity:number;radius:number;color:string;background:string;align:'left'|'center'|'right';fit:'cover'|'contain';focalX:number;focalY:number };
export const fontWeights=[100,200,300,400,500,600,700,800,900] as const;
export function typographyAt(box:Box){const fontWeight=box.fontWeight??400;return {fontWeight,fontFamily:box.fontFamily==='inter'||![400,700].includes(fontWeight)?'Inter, Arial, sans-serif':'Arial, Helvetica, sans-serif'};}
export type MotionSpec = RevealOptions & { enter:boolean;distance:number;duration:number;delay:number;hover:number };
export type ModelSpec = { svg:string;depth:number;bevel:number;metalness:number;roughness:number;transmission:number;ior:number;clearcoat:number;color:string;rotate:boolean;pointer:number };
export type Layer = { id:string;name:string;type:'text'|'image'|'model';text:string;src:string;alt:string;hidden:boolean;locked:boolean;box:Box;overrides:Partial<Record<Breakpoint,Partial<Box>>>;motion:MotionSpec;model:ModelSpec;surface?:Surface };
export type Section = { id:string;name:string;height:number;background:string;backgroundMode?:'solid'|'gradient';layout:'free'|'row'|'column';gap:number;padding:number;children:Layer[];surface?:Surface };
export type Page = { id:string;name:string;sections:Section[] };
export type Document = { version:2;pages:Page[] };
export const widths:Record<Breakpoint,number>={desktop:1440,tablet:768,mobile:390};
export const defaultBox:Box={x:48,y:48,width:600,height:140,fontSize:80,lineHeight:.95,tracking:-.06,rotation:0,opacity:1,radius:0,color:'#f2f2f0',background:'#000000',align:'left',fit:'cover',focalX:50,focalY:50};
export const defaultModel:ModelSpec={svg:'',depth:25,bevel:3,metalness:.95,roughness:.15,transmission:0,ior:1.5,clearcoat:1,color:'#151922',rotate:false,pointer:4};
export function makeLayer(type:Layer['type'],id:string,text='',box:Partial<Box>={}):Layer{return {id,name:text.split('\n')[0].slice(0,40)||({text:'新文字',image:'新图片',model:'3D 雕塑'})[type],type,text,src:'/images/hero-final.png',alt:'',hidden:false,locked:false,box:{...defaultBox,...box},overrides:{},motion:{enter:false,distance:30,duration:.85,delay:0,hover:1.02},model:{...defaultModel}};}
export function boxAt(layer:Layer,bp:Breakpoint):Box{
 const scale=widths[bp]/1440;
 const responsive=bp==='desktop'?{}:{x:layer.box.x*scale,y:layer.box.y*scale,width:layer.box.width*scale,height:layer.box.height*scale,fontSize:Math.max(14,layer.box.fontSize*scale)};
 return {...layer.box,...responsive,...layer.overrides[bp]};
}
export function sectionHeight(section:Section,bp:Breakpoint){return Math.max(bp==='desktop'?100:180,section.height*widths[bp]/1440,...section.children.filter(l=>!l.hidden).map(l=>{const b=boxAt(l,bp);return b.y+b.height+(bp==='desktop'?0:24)}));}
export function updateLayer(doc:Document,id:string,update:(layer:Layer)=>Layer):Document{return {...doc,pages:doc.pages.map(p=>({...p,sections:p.sections.map(s=>({...s,children:s.children.map(l=>l.id===id?update(l):l)}))}))};}
export function patchBox(doc:Document,id:string,bp:Breakpoint,patch:Partial<Box>){return updateLayer(doc,id,l=>bp==='desktop'?{...l,box:{...l.box,...patch}}:{...l,overrides:{...l.overrides,[bp]:{...l.overrides[bp],...patch}}});}
export function migrate():Document{
 let count=0;const layer=(type:Layer['type'],text:string,box:Partial<Box>={})=>makeLayer(type,`m-${++count}`,text,box);
 const section=(name:string,height:number,background:string,children:Layer[]):Section=>({id:`s-${++count}`,name,height,background,children,layout:'free',gap:24,padding:48});
 const art=(src:string,box:Partial<Box>)=>({...layer('image','',box),src,name:'项目主视觉',alt:'Original concept artwork'});
 const hero=section('Hero / 首屏',1000,'#173bff',[
  layer('text','A / FORM',{fontSize:22,width:260,height:36,y:28}),
  layer('text',saved.text.heroLine1,{x:40,y:180,width:1360,height:180,fontSize:168}),
  layer('model','',{x:640,y:240,width:680,height:620}),
  layer('text',saved.text.heroLine2,{x:40,y:370,width:1340,height:240,fontSize:215}),
  layer('text',saved.text.heroNote,{x:48,y:850,width:400,height:70,fontSize:22,tracking:-.025}),
  layer('text',saved.text.heroCaption,{x:930,y:850,width:460,height:80,fontSize:22,tracking:-.025})]);
 hero.backgroundMode='gradient';
 const workSections=projects.map((p,i)=>section(p.name,1000,i===2?'#000000':'#f2f2f0',[
  art(p.image,{x:i%2?570:48,y:100,width:820,height:730}),
  layer('text',p.number,{x:i%2?48:930,y:100,width:150,height:100,fontSize:100,color:i===2?'#f2f2f0':'#173bff'}),
  layer('text',p.name,{x:i%2?48:930,y:240,width:440,height:150,fontSize:64,color:i===2?'#f2f2f0':'#000000'}),
  layer('text',p.description+'\n\nSELF-INITIATED / CONCEPT PROJECT',{x:i%2?48:930,y:450,width:420,height:230,fontSize:24,tracking:-.02,lineHeight:1.4,color:i===2?'#f2f2f0':'#000000'})]));
 const home:Page={id:'home',name:'首页',sections:[hero,section('Selected Works',360,'#f2f2f0',[layer('text','SELECTED WORKS',{x:48,y:90,width:1300,height:160,fontSize:135,color:'#000000'})]),...workSections.slice(0,2),section('Manifesto',650,'#000000',[layer('text','FORM IS A LANGUAGE.\nMAKE IT SAY SOMETHING.',{x:48,y:160,width:1340,height:360,fontSize:105})]),...workSections.slice(2),section('About',760,'#f2f2f0',[layer('text',saved.text.aboutHeading,{width:900,height:640,fontSize:112,color:'#000000'}),layer('text',saved.text.aboutBody+'\n\n'+saved.text.aboutSecond,{x:1000,y:350,width:380,height:320,fontSize:24,lineHeight:1.4,tracking:-.02,color:'#000000'})]),section('Contact',600,'#173bff',[layer('text',saved.text.contactHeading,{width:1300,height:340,fontSize:150}),layer('text',saved.text.contactBody,{y:440,width:800,height:110,fontSize:24,lineHeight:1.3,tracking:-.02})])]};
 const document:Document={version:2,pages:[home,...projects.map(p=>({id:p.slug,name:p.name,sections:[section('Introduction',650,'#000000',[layer('text',p.name,{y:140,width:1320,height:200,fontSize:155}),layer('text',p.role+' / '+p.year+'\nSELF-INITIATED / CONCEPT PROJECT',{y:440,width:1200,height:100,fontSize:24,tracking:-.02})]),section('Main visual',1100,'#000000',[art(p.image,{x:0,y:0,width:1440,height:1100})]),section('Project story',700,'#f2f2f0',[layer('text',p.statement,{width:650,height:550,fontSize:95,color:'#000000'}),layer('text',p.narrative,{x:850,y:170,width:510,height:420,fontSize:28,lineHeight:1.4,tracking:-.025,color:'#000000'})]),section('Detail study',1000,'#f2f2f0',[art(p.image,{x:48,y:100,width:700,height:800}),art(p.image,{x:820,y:300,width:570,height:570})])]}))]};
 // Mobile starts with readable, stacked editorial sections, independently editable.
 for(const p of document.pages)for(const s of p.sections){
  if(s===hero){
   const layouts=[{x:18,y:20,width:354,height:30,fontSize:16},{x:12,y:110,width:366,height:55,fontSize:45},{x:100,y:170,width:280,height:290},{x:12,y:185,width:366,height:70,fontSize:58},{x:18,y:475,width:180,height:70,fontSize:14},{x:205,y:475,width:167,height:85,fontSize:14}];
   s.children.forEach((l,i)=>{l.overrides.mobile=layouts[i]});continue;
  }
  let y=30;
  for(const l of s.children){
   const fontSize=l.type==='text'?Math.min(52,Math.max(16,l.box.fontSize*.45)):16;
   const height=l.type!=='text'?Math.min(440,354*l.box.height/l.box.width):Math.max(fontSize*1.3,Math.ceil(l.text.length/Math.max(8,354/(fontSize*.55)))*fontSize*1.35+24);
   l.overrides.mobile={x:18,y,width:354,height,fontSize,lineHeight:l.box.fontSize<40?1.4:1};y+=height+24;
  }
 }
 return document;
}
export function referenceSkeletonHome():Page{
 let n=0;const text=(value:string,box:Partial<Box>={})=>makeLayer('text',`sk-l-${++n}`,value,box);
 const image=(index:number,box:Partial<Box>={})=>{const p=projects[index%projects.length];return {...makeLayer('image',`sk-l-${++n}`,'',box),name:p.name,src:p.image,alt:p.alt};};
 const section=(name:string,height:number,background:string,children:Layer[]):Section=>({id:`sk-s-${++n}`,name,height,background,layout:'free',gap:24,padding:48,children});
 const home:Page={id:'home',name:'首页',sections:[
  section('灰底引言',760,'#929291',[text('A / FORM — INDEPENDENT DESIGNER',{x:48,y:32,width:650,height:35,fontSize:18,color:'#000000'}),text('IDEAS\nIN MOTION.',{x:260,y:190,width:920,height:310,fontSize:156,align:'center',color:'#000000'}),text('Brand identity, art direction and digital experiences shaped with clarity and tension.',{x:480,y:550,width:480,height:90,fontSize:22,align:'center',lineHeight:1.35,tracking:-.02,color:'#000000'})]),
  section('环形项目',980,'#000000',[...Array.from({length:10},(_,i)=>{const angle=i*Math.PI*2/10-Math.PI/2;return image(i,{x:620+Math.cos(angle)*470,y:430+Math.sin(angle)*330,width:200,height:145,rotation:(i-4.5)*6});}),text('SELECTED\nWORK',{x:520,y:380,width:400,height:180,fontSize:82,align:'center'}),text('04 CONCEPT STUDIES',{x:570,y:570,width:300,height:30,fontSize:16,align:'center'})]),
  section('Recent Works 节奏带',760,'#000000',[text('RECENT WORKS\nHEY, CREATIVE DESIGN\nIS FOR THE FUTURE.',{x:48,y:80,width:720,height:280,fontSize:70}),...Array.from({length:9},(_,i)=>image(i,{x:i*160,y:580-(i%3)*40,width:160,height:180+(i%3)*40}))]),
  section('散点叙事',850,'#000000',[...[[70,90,220,170],[1050,100,300,160],[180,600,340,190],[1120,570,190,220]].map((b,i)=>image(i,{x:b[0],y:b[1],width:b[2],height:b[3]})),text('EVERYTHING\nTO → CREATE\nANYTHING',{x:500,y:350,width:440,height:180,fontSize:54,align:'center'})]),
  section('弧形视觉墙',720,'#000000',[...Array.from({length:15},(_,i)=>image(i,{x:45+(i%5)*275,y:80+Math.floor(i/5)*185,width:260,height:165,rotation:(i%5-2)*2,radius:12}))]),
  section('创意设计叙事',850,'#3d3d3d',[text('CREATIVE DESIGN\nWORK\nFOR A FUTURE.',{x:48,y:230,width:620,height:330,fontSize:92}),...[[1050,80],[820,330],[1050,350],[1050,610]].map((p,i)=>image(i,{x:p[0],y:p[1],width:230,height:190}))]),
  section('六宫格项目',900,'#000000',[text('CREATIVE\nSYSTEMS',{x:420,y:60,width:600,height:190,fontSize:100,align:'center'}),...Array.from({length:6},(_,i)=>image(i,{x:190+(i%3)*360,y:330+Math.floor(i/3)*235,width:340,height:210,radius:6})),text('STOP OVERTHINKING. MAKE THE IDEA VISIBLE.',{x:390,y:805,width:660,height:40,fontSize:24,align:'center'})]),
  section('联系',620,'#173bff',[text(saved.text.contactHeading,{x:48,y:120,width:1340,height:220,fontSize:150}),text(saved.text.contactBody,{x:48,y:440,width:650,height:100,fontSize:24,lineHeight:1.35,tracking:-.02})])
 ]};
 for(const s of home.sections){let y=24;for(const l of s.children){const fs=l.type==='text'?Math.min(48,Math.max(14,l.box.fontSize*.42)):14,h=l.type==='text'?Math.max(44,Math.ceil(l.text.length/18)*fs*1.12):190;l.overrides.mobile={x:18,y,width:354,height:h,fontSize:fs,rotation:0};y+=h+18;}}
 return home;
}
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const color=(v:unknown)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
export const safeSource=(v:unknown)=>typeof v==='string'&&(/^\/images\/[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)$/.test(v)||(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v)&&v.length<2_800_000));
function validBox(x:unknown,partial=false):boolean{
 if(!record(x))return false;
 const bounds:Record<string,[number,number]>={x:[-5000,10000],y:[-5000,20000],width:[10,5000],height:[10,10000],fontSize:[8,600],lineHeight:[.5,3],tracking:[-.2,1],rotation:[-360,360],opacity:[0,1],radius:[0,1000],focalX:[0,100],focalY:[0,100]};
 // Typography is optional so documents saved before font controls remain valid.
 if(!partial&&!Object.keys(defaultBox).every(k=>Object.hasOwn(x,k)))return false;
 return Object.entries(x).every(([k,v])=>k==='fontWeight'?typeof v==='number'&&fontWeights.some(w=>w===v):k==='fontFamily'?v==='arial'||v==='inter':bounds[k]?typeof v==='number'&&Number.isFinite(v)&&v>=bounds[k][0]&&v<=bounds[k][1]:k==='color'||k==='background'?color(v):k==='align'?['left','center','right'].includes(String(v)):k==='fit'?['cover','contain'].includes(String(v)):false);
}
export function validDocument(value:unknown):value is Document{
 if(!record(value)||value.version!==2||!Array.isArray(value.pages)||value.pages.length!==5)return false;
 const pages=value.pages;
 if(!['home',...projects.map(p=>p.slug)].every(id=>pages.some((p:unknown)=>record(p)&&p.id===id)))return false;
 if(JSON.stringify(value).length>16_000_000)return false;
 const ids=new Set<string>();let total=0;
 const id=(v:unknown)=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v)||ids.has(v))return false;ids.add(v);return true;};
 const short=(v:unknown,max=200)=>typeof v==='string'&&v.length<=max;
 return value.pages.every(p=>record(p)&&id(p.id)&&short(p.name)&&Array.isArray(p.sections)&&p.sections.length>0&&p.sections.length<=40&&p.sections.every(s=>{
  if(!record(s)||!validSurface(s.surface)||!id(s.id)||!short(s.name)||!color(s.background)||!['free','row','column'].includes(String(s.layout))||!Array.isArray(s.children)||typeof s.height!=='number'||s.height<100||s.height>10000||typeof s.gap!=='number'||s.gap<0||s.gap>300||typeof s.padding!=='number'||s.padding<0||s.padding>300)return false;
  return s.children.every(l=>{if(++total>500||!record(l)||!id(l.id)||!short(l.name)||!['text','image','model'].includes(String(l.type))||!short(l.text,10000)||!safeSource(l.src)||!short(l.alt,2000)||typeof l.hidden!=='boolean'||typeof l.locked!=='boolean'||!validBox(l.box)||!record(l.overrides)||!Object.entries(l.overrides).every(([k,v])=>['desktop','tablet','mobile'].includes(k)&&validBox(v,true))||!record(l.motion)||!validReveal(l.motion)||!validSurface(l.surface)||!record(l.model))return false;
   const m=l.motion,model=l.model;
   return typeof m.enter==='boolean'&&typeof m.distance==='number'&&m.distance>=0&&m.distance<=100&&typeof m.duration==='number'&&m.duration>=.1&&m.duration<=5&&typeof m.delay==='number'&&m.delay>=0&&m.delay<=5&&typeof m.hover==='number'&&m.hover>=1&&m.hover<=1.2&&short(model.svg,100000)&&!/<(?:script|foreignObject|image|use|text|filter|mask)\b|\bon\w+\s*=|(?:href|url)\s*[=(]|<!DOCTYPE|<!ENTITY/i.test(String(model.svg))&&color(model.color)&&typeof model.rotate==='boolean'&&Object.entries({depth:[1,100],bevel:[0,20],metalness:[0,1],roughness:[0,1],transmission:[0,1],ior:[1,2.5],clearcoat:[0,1],pointer:[0,10]}).every(([k,[min,max]])=>typeof model[k]==='number'&&Number.isFinite(model[k])&&(model[k] as number)>=min&&(model[k] as number)<=max);
  });
 }));
}
