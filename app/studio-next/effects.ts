export type Reveal = 'fade' | 'block-wipe' | 'line-rise';
export type RevealOptions = { reveal?:Reveal;stagger?:number;coverColor?:string;direction?:'left'|'right' };
export type Surface = { kind:'none'|'painted'|'rubber'|'metal';color:string;strength:number;grain:number;bevel:number;bolts:boolean;cut:boolean };
export const cleanSurface:Surface={kind:'none',color:'#ef5700',strength:.7,grain:.15,bevel:14,bolts:false,cut:false};
export const surfacePresets:Record<Surface['kind'],Surface>={
 none:cleanSurface,
 painted:{...cleanSurface,kind:'painted',color:'#ef5700',bolts:true,cut:true},
 rubber:{...cleanSurface,kind:'rubber',color:'#171717',strength:.8,grain:.2,bevel:18},
 metal:{...cleanSurface,kind:'metal',color:'#777d85',strength:.65,grain:.3,bevel:10},
};
export const modelPresets={
 painted:{color:'#ee5700',metalness:.35,roughness:.3,transmission:0,ior:1.5,clearcoat:.85},
 rubber:{color:'#141414',metalness:0,roughness:.8,transmission:0,ior:1.45,clearcoat:.12},
 metal:{color:'#a7adb4',metalness:1,roughness:.22,transmission:0,ior:1.5,clearcoat:.3},
};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const hex=(x:unknown)=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);
const range=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function validSurface(s:unknown):boolean{
 return s===undefined||(object(s)&&Object.keys(s).length===7&&['none','painted','rubber','metal'].includes(String(s.kind))&&hex(s.color)&&range(s.strength,0,1)&&range(s.grain,0,1)&&range(s.bevel,0,40)&&typeof s.bolts==='boolean'&&typeof s.cut==='boolean');
}
export function validReveal(m:Record<string,unknown>):boolean{
 return (m.reveal===undefined||['fade','block-wipe','line-rise'].includes(String(m.reveal)))&&(m.stagger===undefined||range(m.stagger,0,.5))&&(m.coverColor===undefined||hex(m.coverColor))&&(m.direction===undefined||['left','right'].includes(String(m.direction)));
}
export function revealLines(text:string):string[]{return text.replace(/\r\n/g,'\n').split('\n');}
// Bound total stagger: very long text must not take minutes to appear.
export function lineDelay(index:number,stagger:number):number{return Math.min(index*stagger,2);}
