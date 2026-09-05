import {useState} from 'react';
import type {Alignment} from './selection';
export default function SelectionControls({count,disabled,grouped,onAlign,onDistribute,onGroup,onScale,onClear}:{count:number;disabled:boolean;grouped:boolean;onAlign:(mode:Alignment)=>void;onDistribute:(axis:'x'|'y')=>void;onGroup:(ungroup:boolean)=>void;onScale:(factor:number)=>void;onClear:()=>void}){
 const [scale,setScale]=useState('100');
 return <section className="v2-batch" aria-label="批量排版"><div className="v2-batch-heading"><strong>已选 {count} 个图层</strong><button onClick={onClear}>取消选择</button></div><p>Shift 点选增减 · 空白处拖动框选 · 同一章节内操作</p><fieldset disabled={disabled}>
 <div className="v2-batch-grid">{([['left','左对齐'],['center','水平居中'],['right','右对齐'],['top','顶对齐'],['middle','垂直居中'],['bottom','底对齐']] as [Alignment,string][]).map(([mode,label])=><button key={mode} disabled={count<2} onClick={()=>onAlign(mode)}>{label}</button>)}</div>
 <div className="v2-row"><button disabled={count<3} onClick={()=>onDistribute('x')}>水平等距</button><button disabled={count<3} onClick={()=>onDistribute('y')}>垂直等距</button></div>
 <div className="v2-row"><button disabled={count<2} onClick={()=>onGroup(false)}>组合</button><button disabled={!grouped} onClick={()=>onGroup(true)}>取消组合</button></div>
 <label>整体等比缩放 %<input aria-label="整体等比缩放百分比" type="number" min="10" max="400" value={scale} onChange={e=>setScale(e.target.value)}/></label><button disabled={!count||!Number.isFinite(Number(scale))||Number(scale)<10||Number(scale)>400} onClick={()=>{onScale(Number(scale)/100);setScale('100')}}>应用等比缩放</button>
 </fieldset>{disabled&&<p>请在自由布局章节选择未锁定、未隐藏的图层。</p>}</section>;
}
