import {useEffect,useRef,useState} from 'react';
import {type Document} from './document';
import {loadDocument,saveDocument} from './local-document';
import {assetPath} from '../paths';
import {cloudEnabled} from './deployment-mode';
import RemoteSync from './remote-sync';
export default cloudEnabled?RemoteSync:LocalSync;
function LocalSync({doc,blocked,onLoad,onSaved}:{doc:Document;dirty:boolean;blocked:boolean;onLoad:(doc:Document)=>void;onSaved:(doc:Document)=>void}){
 const [ready,setReady]=useState(false),[message,setMessage]=useState('正在恢复副本草稿…');
 const latest=useRef({onLoad,onSaved});latest.current={onLoad,onSaved};const saved=useRef('');
 useEffect(()=>{let active=true;void loadDocument().then(value=>{if(!active)return;saved.current=JSON.stringify(value);latest.current.onLoad(value);setReady(true);setMessage('本地副本 · 自动保存 · 不连接线上账户');}).catch(()=>setMessage('读取失败，已暂停自动保存。请刷新重试，避免覆盖已有草稿。'));return()=>{active=false}},[]);
 useEffect(()=>{if(!ready||blocked||JSON.stringify(doc)===saved.current)return;const timer=setTimeout(()=>{void saveDocument(doc).then(()=>{saved.current=JSON.stringify(doc);latest.current.onSaved(doc);setMessage('副本已保存 · 已同步本浏览器预览 · 未修改线上网站');}).catch(()=>setMessage('本机保存失败，请立即导出备份。'));},800);return()=>clearTimeout(timer)},[doc,ready,blocked]);
 return <section className="v2-cloud" aria-label="副本保存状态"><p role="status">{message}</p><a href={assetPath('/')} target="_blank" rel="noreferrer">打开副本预览 ↗</a><p>这是隔离测试副本，Cloudflare 登录与线上发布已禁用。</p></section>;
}
