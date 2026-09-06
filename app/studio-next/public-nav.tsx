import {assetPath} from '../paths';
import {useEffect,useState} from 'react';
import type {Page} from './document';

export default function PublicNav({pages,pageId}:{pages:Page[];pageId:string}){
 const [compact,setCompact]=useState(false);
 useEffect(()=>{
  const update=()=>setCompact(previous=>window.scrollY>(previous?24:64));
  update();
  window.addEventListener('scroll',update,{passive:true});
  return ()=>window.removeEventListener('scroll',update);
 },[]);
 return <header className={`v2-public-nav${compact?' is-compact':''}`}>
  <a className="v2-nav-brand" href={assetPath('/')} aria-label="A / FORM home">A / FORM</a>
  <nav aria-label="Portfolio pages">{pages.map(page=><a key={page.id} aria-current={page.id===pageId?'page':undefined} href={assetPath(page.id==='home'?'/':'/work/'+page.id+'/')}>{page.id==='home'?'Home':page.name.toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase())}</a>)}</nav>
  <a className="v2-nav-action" href={assetPath('/studio-next/')}>Open Studio</a>
 </header>;
}
