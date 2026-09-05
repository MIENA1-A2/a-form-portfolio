import {boxAt,validDocument,type Box,type Breakpoint,type Document,type Layer,type Page} from './document';

export type Bounds={x:number;y:number;width:number;height:number};
export type Alignment='left'|'center'|'right'|'top'|'middle'|'bottom';
export function selectionLayers(page:Page,ids:string[]){return page.sections.flatMap(s=>s.children).filter(l=>ids.includes(l.id)&&!l.hidden&&!l.locked);}
export function boundsOf(layers:Layer[],bp:Breakpoint):Bounds|null{
 if(!layers.length)return null;const boxes=layers.map(l=>boxAt(l,bp)),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));
 return {x,y,width:Math.max(...boxes.map(b=>b.x+b.width))-x,height:Math.max(...boxes.map(b=>b.y+b.height))-y};
}
export function selectLayer(page:Page,current:string[],id:string,additive=false){
 const section=page.sections.find(s=>s.children.some(l=>l.id===id));if(!section)return [];
 const layer=section.children.find(l=>l.id===id)!;
 const peers=layer.groupId?section.children.filter(l=>l.groupId===layer.groupId&&!l.hidden&&!l.locked).map(l=>l.id):[id];
 const picked=peers.length?peers:[id];
 if(!additive)return picked;
 const same=current.filter(key=>section.children.some(l=>l.id===key));
 return picked.every(key=>same.includes(key))?same.filter(key=>!picked.includes(key)):[...new Set([...same,...picked])];
}
export function marqueeSelection(page:Page,sectionId:string,rect:Bounds,bp:Breakpoint){
 const section=page.sections.find(s=>s.id===sectionId);if(!section||section.layout!=='free')return [];
 let ids:string[]=[];
 for(const layer of section.children){if(layer.hidden||layer.locked)continue;const b=boxAt(layer,bp);if(b.x<=rect.x+rect.width&&b.x+b.width>=rect.x&&b.y<=rect.y+rect.height&&b.y+b.height>=rect.y)ids=[...new Set([...ids,...selectLayer(page,[],layer.id)])];}
 return ids;
}
function selectedSection(doc:Document,ids:string[]){const sections=doc.pages.flatMap(p=>p.sections).filter(s=>s.children.some(l=>ids.includes(l.id)));if(sections.length!==1||sections[0].layout!=='free')return null;return sections[0];}
export function patchSelection(doc:Document,ids:string[],bp:Breakpoint,patch:(b:Box,l:Layer)=>Partial<Box>){
 const section=selectedSection(doc,ids);if(!section)return doc;
 const next={...doc,pages:doc.pages.map(p=>({...p,sections:p.sections.map(s=>s.id!==section.id?s:{...s,children:s.children.map(l=>{if(!ids.includes(l.id)||l.locked||l.hidden)return l;const value=patch(boxAt(l,bp),l);return bp==='desktop'?{...l,box:{...l.box,...value}}:{...l,overrides:{...l.overrides,[bp]:{...l.overrides[bp],...value}}};})})}))};
 return validDocument(next)?next:doc;
}
export function translateSelection(doc:Document,ids:string[],bp:Breakpoint,dx:number,dy:number){
 const section=selectedSection(doc,ids);if(!section||!Number.isFinite(dx)||!Number.isFinite(dy))return doc;
 const boxes=section.children.filter(l=>ids.includes(l.id)&&!l.locked&&!l.hidden).map(l=>boxAt(l,bp));if(!boxes.length)return doc;
 const x=Math.max(Math.max(...boxes.map(b=>-5000-b.x)),Math.min(dx,Math.min(...boxes.map(b=>10000-b.x))));
 const y=Math.max(Math.max(...boxes.map(b=>-5000-b.y)),Math.min(dy,Math.min(...boxes.map(b=>20000-b.y))));
 return patchSelection(doc,ids,bp,b=>({x:b.x+x,y:b.y+y}));
}
export function alignSelection(doc:Document,ids:string[],bp:Breakpoint,mode:Alignment){
 const section=selectedSection(doc,ids);if(!section)return doc;const layers=section.children.filter(l=>ids.includes(l.id)&&!l.locked&&!l.hidden),bounds=boundsOf(layers,bp);if(!bounds||layers.length<2)return doc;
 return patchSelection(doc,ids,bp,b=>mode==='left'?{x:bounds.x}:mode==='right'?{x:bounds.x+bounds.width-b.width}:mode==='center'?{x:bounds.x+(bounds.width-b.width)/2}:mode==='top'?{y:bounds.y}:mode==='bottom'?{y:bounds.y+bounds.height-b.height}:{y:bounds.y+(bounds.height-b.height)/2});
}
export function distributeSelection(doc:Document,ids:string[],bp:Breakpoint,axis:'x'|'y'){
 const section=selectedSection(doc,ids);if(!section)return doc;const layers=section.children.filter(l=>ids.includes(l.id)&&!l.locked&&!l.hidden).sort((a,b)=>boxAt(a,bp)[axis]-boxAt(b,bp)[axis]);if(layers.length<3)return doc;
 const size=axis==='x'?'width':'height',first=boxAt(layers[0],bp),last=boxAt(layers[layers.length-1],bp),gap=(last[axis]+last[size]-first[axis]-layers.reduce((sum,l)=>sum+boxAt(l,bp)[size],0))/(layers.length-1);
 let cursor=first[axis];const positions=new Map(layers.map(l=>{const value=cursor;cursor+=boxAt(l,bp)[size]+gap;return [l.id,value];}));
 return patchSelection(doc,ids,bp,(_,l)=>({[axis]:positions.get(l.id)!}));
}
export function scaleSelection(doc:Document,ids:string[],bp:Breakpoint,factor:number){
 if(!Number.isFinite(factor)||factor<=0)return doc;const section=selectedSection(doc,ids);if(!section)return doc;const bounds=boundsOf(section.children.filter(l=>ids.includes(l.id)&&!l.locked&&!l.hidden),bp);if(!bounds)return doc;
 return patchSelection(doc,ids,bp,(b,l)=>({x:bounds.x+(b.x-bounds.x)*factor,y:bounds.y+(b.y-bounds.y)*factor,width:b.width*factor,height:b.height*factor,...(l.type==='text'?{fontSize:b.fontSize*factor}:{})}));
}
export function groupSelection(doc:Document,ids:string[],groupId:string|undefined){
 const section=selectedSection(doc,ids);if(!section||ids.length<2)return doc;
 const next={...doc,pages:doc.pages.map(p=>({...p,sections:p.sections.map(s=>s.id!==section.id?s:{...s,children:s.children.map(l=>ids.includes(l.id)&&!l.locked&&!l.hidden?{...l,groupId}:l)})}))};return validDocument(next)?next:doc;
}
export function resizeProportional(box:Box,dx:number,dy:number,keepRatio:boolean):Partial<Box>{
 if(keepRatio){const factor=Math.max(10/box.width,10/box.height,Math.min(5000/box.width,10000/box.height,1+(Math.abs(dx/box.width)>=Math.abs(dy/box.height)?dx/box.width:dy/box.height)));return {width:box.width*factor,height:box.height*factor};}
 return {width:Math.min(5000,Math.max(10,box.width+dx)),height:Math.min(10000,Math.max(10,box.height+dy))};
}
