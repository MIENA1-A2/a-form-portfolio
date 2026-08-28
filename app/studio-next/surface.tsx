import type {CSSProperties} from 'react';
import type {Surface as SurfaceSpec} from './effects';
import './effects.css';

export default function Surface({value,overlay=false}:{value?:SurfaceSpec;overlay?:boolean}){
 if(!value||value.kind==='none')return null;
 const style={backgroundColor:value.color,'--surface-light':value.strength,'--surface-grain':value.grain,'--surface-bevel':`${value.bevel}px`} as CSSProperties;
 return <div aria-hidden="true" className={`fx-surface fx-${value.kind}${value.cut?' fx-cut':''}${overlay?' fx-overlay':''}`} style={style}><span className="fx-grain"/>{value.bolts&&['tl','tr','bl','br'].map(p=><i key={p} className={`fx-bolt fx-${p}`}/>)}</div>;
}
