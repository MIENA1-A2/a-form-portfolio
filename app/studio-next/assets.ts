const databaseName=typeof location!=='undefined'&&location.pathname.includes('/preview/')?'aform-visual-studio-preview':'aform-visual-studio-rebuild';
// SVG is parsed as inert XML and rebuilt from a small geometry-only allowlist.
// Never render uploaded SVG markup into the DOM or load referenced resources.
export function sanitizeSvg(source:string):string{
 if(source.length>100000||/<!DOCTYPE|<!ENTITY/i.test(source))throw Error('SVG 过大或包含不支持的文档声明（上限 100 KB）。');
 const doc=new DOMParser().parseFromString(source,'image/svg+xml');
 if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw Error('无法读取 SVG，请重新导出。');
 const allowed=new Set(['svg','g','path','rect','circle','ellipse','polygon','title','desc']);
 const attrs=new Set(['viewBox','width','height','x','y','rx','ry','cx','cy','r','d','points','transform','fill-rule','fill']);
 const nodes=[doc.documentElement,...doc.documentElement.querySelectorAll('*')];
 if(nodes.length>100)throw Error('SVG 图形过多，请简化为 100 个以内的闭合图形。');
 let commands=0,shapes=0;
 for(const node of nodes){
  if(!allowed.has(node.localName))throw Error('SVG 仅支持闭合路径与基本形状；请先将文字、描边转轮廓，移除滤镜、蒙版和外部图片。');
  for(const a of [...node.attributes]){
   if(a.name==='xmlns')continue;
   if(!attrs.has(a.name)||/url\s*\(|javascript:|https?:|data:/i.test(a.value))throw Error('SVG 包含不支持的属性，请导出纯轮廓 SVG。');
   if(a.name!=='fill'&&a.name!=='fill-rule'&&/[^0-9a-zA-Z.,+\-\s()]/.test(a.value))throw Error('SVG 几何属性无效。');
  }
  if(node.localName==='path'){
   const d=node.getAttribute('d')||'';commands+=(d.match(/[a-df-z]/gi)||[]).length;
   if(!/[zZ]\s*$/.test(d)||d.split(/[mM]/).slice(1).some(p=>!/[zZ]\s*$/.test(p)))throw Error('路径必须闭合；请先将描边转为轮廓。');
  }
  if(['path','rect','circle','ellipse','polygon'].includes(node.localName))shapes++;
 }
 if(commands>1500||!shapes)throw Error('SVG 过于复杂或没有可生成模型的闭合形状。');
 return new XMLSerializer().serializeToString(doc.documentElement);
}
export async function importImage(file:File):Promise<string>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15_000_000)throw Error('请选择 15 MB 以内的 PNG、JPG 或 WebP 图片。');
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width*bitmap.height>40_000_000)throw Error('图片尺寸过大，请先缩小到 4000 万像素以内。');
  const scale=Math.min(1,2048/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('浏览器无法处理图片。');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const result=canvas.toDataURL('image/webp',.85);if(result.length>2_800_000)throw Error('压缩后仍超过 2 MB，请选择更小的图片。');return result;
 }finally{bitmap.close();}
}
export async function draftStore(mode:'read'|'write',value?:unknown):Promise<unknown>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(databaseName,2);
  request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
  request.onerror=()=>reject(Error('无法访问本机草稿，请导出文件保存。'));
  request.onsuccess=()=>{
   const db=request.result,tx=db.transaction('drafts',mode==='read'?'readonly':'readwrite'),store=tx.objectStore('drafts');let result:unknown;
   const op=store.get('v2');op.onsuccess=()=>{
    result=op.result;if(mode==='read')return;
    const previous=op.result,history=store.get('history');history.onsuccess=()=>{
     const entries=Array.isArray(history.result)?history.result:[];
     if(previous&&JSON.stringify(previous)!==JSON.stringify(value))entries.push({time:new Date().toISOString(),document:previous});
     store.put(entries.slice(-10),'history');store.put(value,'v2');
    };
   };
   tx.oncomplete=()=>{db.close();resolve(result)};tx.onabort=tx.onerror=()=>{db.close();reject(Error('草稿保存失败，可能是存储空间不足；请导出备份。'))};
  };
 });
}
export async function readHistory():Promise<Array<{time:string;document:unknown}>>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(databaseName,2);
  request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
  request.onerror=()=>reject(Error('无法读取历史记录'));
  request.onsuccess=()=>{const db=request.result,tx=db.transaction('drafts','readonly'),op=tx.objectStore('drafts').get('history');op.onsuccess=()=>resolve(Array.isArray(op.result)?op.result:[]);tx.oncomplete=()=>db.close();tx.onerror=()=>{db.close();reject(Error('无法读取历史记录'))};};
 });
}
