import {DurableObject} from 'cloudflare:workers';
import {validDocument} from '../app/studio-next/document';

// One strongly-consistent object per portfolio. Parameterized SQL and a single
// synchronous transaction protect the revision check and all document chunks.
export class VisualStore extends DurableObject<Env> {
 constructor(ctx:DurableObjectState,env:Env){
  super(ctx,env);
  this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS visual_meta (slot TEXT PRIMARY KEY, revision INTEGER NOT NULL, updated TEXT NOT NULL)');
  this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS visual_chunks (slot TEXT NOT NULL, part INTEGER NOT NULL, body TEXT NOT NULL, PRIMARY KEY(slot,part))');
 }
 private meta(slot:string){return this.ctx.storage.sql.exec<{revision:number;updated:string}>('SELECT revision,updated FROM visual_meta WHERE slot=?',slot).toArray()[0]??{revision:0,updated:''};}
 private read(slot:string){const chunks=this.ctx.storage.sql.exec<{body:string}>('SELECT body FROM visual_chunks WHERE slot=? ORDER BY part',slot).toArray();return chunks.length?JSON.parse(chunks.map(c=>c.body).join('')):null;}
 private write(slot:string,body:string,revision:number,updated:string){
  this.ctx.storage.sql.exec('DELETE FROM visual_chunks WHERE slot=?',slot);
  // Bound each row, including documents containing non-ASCII text or images.
  for(let i=0;i<body.length;i+=100000)this.ctx.storage.sql.exec('INSERT INTO visual_chunks(slot,part,body) VALUES(?,?,?)',slot,i/100000,body.slice(i,i+100000));
  this.ctx.storage.sql.exec('INSERT INTO visual_meta(slot,revision,updated) VALUES(?,?,?) ON CONFLICT(slot) DO UPDATE SET revision=excluded.revision,updated=excluded.updated',slot,revision,updated);
 }
 state(){return {document:this.read('draft'),...this.meta('draft'),publishedRevision:this.meta('published').revision};}
 published(){return {document:this.read('published'),...this.meta('published')};}
 save(body:string,baseRevision:number,publish:boolean){
  if(body.length>16000000)return {error:'文档超过 16 MB。',status:413};
  let document:unknown;try{document=JSON.parse(body)}catch{return {error:'文档格式错误。',status:400}}
  if(!validDocument(document))return {error:'文档内容或素材不安全，未保存。',status:400};
  return this.ctx.storage.transactionSync(()=>{
   const current=this.meta('draft');
   if(current.revision!==baseRevision)return {error:'另一台设备已更新，请先导出本机备份，再加载云端版本。',status:409};
   const revision=current.revision+1,updated=new Date().toISOString();
   this.write('draft',body,revision,updated);
   if(publish)this.write('published',body,revision,updated);
   return {revision,updated,publishedRevision:this.meta('published').revision};
  });
 }
 unpublish(baseRevision:number){return this.ctx.storage.transactionSync(()=>{
  const current=this.meta('draft');if(current.revision!==baseRevision)return {error:'云端版本已变化，请重新加载。',status:409};
  this.ctx.storage.sql.exec("DELETE FROM visual_chunks WHERE slot='published'");
  this.ctx.storage.sql.exec("DELETE FROM visual_meta WHERE slot='published'");
  // Advance the shared revision so another device cannot silently republish.
  const revision=current.revision+1,updated=new Date().toISOString();
  this.ctx.storage.sql.exec("INSERT INTO visual_meta(slot,revision,updated) VALUES('draft',?,?) ON CONFLICT(slot) DO UPDATE SET revision=excluded.revision,updated=excluded.updated",revision,updated);
  return {revision,updated,publishedRevision:0};
 });}
}
