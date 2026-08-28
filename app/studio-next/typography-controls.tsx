import {fontWeights,type Box} from './document';
const labels=['极细','纤细','细体','常规','中等','半粗','粗体','特粗','黑体'];
export default function TypographyControls({box,onChange}:{box:Box;onChange:(patch:Partial<Box>)=>void}){
 const weight=box.fontWeight??400,family=box.fontFamily==='inter'||![400,700].includes(weight)?'inter':'arial';
 return <><label>字体<select aria-label="字体" value={family} onChange={e=>onChange({fontFamily:e.target.value as Box['fontFamily'],fontWeight:e.target.value==='arial'?(weight>=600?700:400):weight})}><option value="arial">Arial / Helvetica</option><option value="inter">Inter · 九档粗细</option></select></label><label>字体粗细<select aria-label="字体粗细" value={weight} onChange={e=>{const fontWeight=Number(e.target.value);onChange({fontWeight,fontFamily:family==='inter'||![400,700].includes(fontWeight)?'inter':'arial'});}}>{fontWeights.map((w,i)=><option key={w} value={w}>{w} · {labels[i]}</option>)}</select></label><p>Arial 支持常规与粗体；选择其他粗细自动切换 Inter。中文使用系统回退字体，粗细以设备支持为准。</p></>;
}
