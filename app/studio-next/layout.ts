import {boxAt,widths,type Box,type Breakpoint,type Layer} from './document';
export function hasLayoutRules(box:Box){return !!((box.widthMode&&box.widthMode!=='legacy')||(box.anchor&&box.anchor!=='free')||box.maxWidth||box.heightMode==='auto');}
export function safePadding(padding:number,width:number){return Math.max(0,Math.min(padding,(Math.max(1,width)-1)/2));}
export function resolveLayoutBox(layer:Layer,bp:Breakpoint,containerWidth=widths[bp]):Box{
 const base=boxAt(layer,bp);containerWidth=Math.max(1,containerWidth);
 const ratio=containerWidth/widths[bp],requestedLeft=base.insetLeft??18,requestedRight=base.insetRight??18;
 const marginScale=Math.min(1,(containerWidth-1)/Math.max(1,requestedLeft+requestedRight));
 const left=requestedLeft*marginScale,right=requestedRight*marginScale,available=Math.max(1,containerWidth-left-right);
 const constrained=hasLayoutRules(base),mode=base.widthMode??'legacy';
 const requested=mode==='fill'?available:mode==='fixed'?base.width:base.width*ratio;
 const width=Math.max(1,Math.min(requested,base.maxWidth||Infinity,constrained?available:Infinity));
 const anchor=base.anchor??(mode==='fill'?'left':'free');
 const requestedX=anchor==='left'?left:anchor==='center'?left+(available-width)/2:anchor==='right'?containerWidth-right-width:base.x*ratio;
 const x=constrained?Math.max(0,Math.min(containerWidth-width,requestedX)):requestedX;
 return {...base,anchor,x,width,y:base.y*ratio,height:constrained?base.height:base.height*ratio,fontSize:constrained?base.fontSize:base.fontSize*ratio};
}
export const layoutKeys=['widthMode','anchor','insetLeft','insetRight','maxWidth','heightMode'] as const;
export const boxLabels:Partial<Record<keyof Box,string>>={x:'X',y:'Y',width:'宽度',height:'高度',fontSize:'字号',fontWeight:'字重',fontFamily:'字体',lineHeight:'行高',tracking:'字距',rotation:'旋转',opacity:'透明度',radius:'圆角',color:'颜色',align:'文字对齐',fit:'图片填充',focalX:'图片焦点X',focalY:'图片焦点Y',widthMode:'宽度规则',anchor:'水平定位',insetLeft:'左边距',insetRight:'右边距',maxWidth:'最大宽度',heightMode:'高度规则'};
