import type {Box,Breakpoint,Layer} from './document';
import {boxLabels} from './layout';
export default function LayoutControls({layer,box,bp,onChange,onReset}:{layer:Layer;box:Box;bp:Breakpoint;onChange:(patch:Partial<Box>)=>void;onReset:(key?:keyof Box)=>void}){
 const overridden=Object.keys(layer.overrides[bp]??{}) as (keyof Box)[];
 return <section className="v2-layout-rules" aria-label="响应式布局约束"><h3>响应式布局</h3>
 <label>宽度规则<select value={box.widthMode??'legacy'} onChange={e=>onChange({widthMode:e.target.value as Box['widthMode']})}><option value="legacy">原画布比例</option><option value="fixed">固定宽度（不超容器）</option><option value="fill">填满可用宽度</option></select></label>
 <label>水平定位<select value={box.anchor??(box.widthMode==='fill'?'left':'free')} onChange={e=>onChange({anchor:e.target.value as Box['anchor']})}><option value="free">原 X 坐标</option><option value="left">靠左</option><option value="center">居中</option><option value="right">靠右</option></select></label>
 {(['insetLeft','insetRight','maxWidth'] as const).map(key=><label key={key}>{boxLabels[key]}<input aria-label={boxLabels[key]} key={key+String(box[key])} type="number" min="0" max={key==='maxWidth'?5000:1000} defaultValue={box[key]??(key==='maxWidth'?0:18)} onBlur={e=>{const n=Number(e.target.value);if(e.target.value!==''&&Number.isFinite(n))onChange({[key]:Math.max(0,Math.min(key==='maxWidth'?5000:1000,n))});}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur()}}/></label>)}
 <p>最大宽度 0 表示不限。左右边距配合“填满”可固定两侧留白。约束图层请使用这些参数定位，不参与自由拖动。</p>
 {layer.type==='text'&&<label>文字高度<select value={box.heightMode??'fixed'} onChange={e=>onChange({heightMode:e.target.value as Box['heightMode']})}><option value="fixed">固定高度</option><option value="auto">内容自动撑高</option></select></label>}
 {box.heightMode==='auto'&&<p>纵向自动布局中，后续内容会顺延；自由画布中仍按 Y 定位，请自行留足空间。</p>}
 {bp!=='desktop'&&<div className="v2-overrides"><h3>当前断点独立属性 · {overridden.length}</h3>{overridden.length? <><button onClick={()=>onReset()}>全部恢复继承</button>{overridden.map(key=><button key={key} onClick={()=>onReset(key)}>↶ {boxLabels[key]??key} · 恢复继承</button>)}</>:<p>全部继承桌面基础规则。原画布比例仍按断点自动换算。</p>}</div>}
 </section>;
}
