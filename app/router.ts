import {useSyncExternalStore} from 'react';
import {basePath} from './paths';

const subscribe=(listener:()=>void)=>{window.addEventListener('popstate',listener);return()=>window.removeEventListener('popstate',listener)};
export function currentPath(){const value=location.pathname.slice(basePath.length)||'/';return value.length>1?value.replace(/\/$/,''):value;}
export const usePathname=()=>useSyncExternalStore(subscribe,currentPath,()=>'/');
export function navigate(path:string){history.pushState({},'',basePath+path);window.dispatchEvent(new PopStateEvent('popstate'));window.scrollTo({top:0,behavior:'instant'});}
