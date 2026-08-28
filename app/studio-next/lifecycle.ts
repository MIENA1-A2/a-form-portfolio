/** Async Canvas initialization may complete after its host has unmounted. */
export function connectLiveTarget<T extends {isConnected:boolean}>(target:T|null|undefined,connect:(target:T)=>void):void{
 if(target?.isConnected)connect(target);
}

/** Editable/translated text is owned by the DOM, never by React child fibers. */
export function syncPlainText(node:{textContent:string|null},text:string):void{
 if(node.textContent!==text)node.textContent=text;
}
