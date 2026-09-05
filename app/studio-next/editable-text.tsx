'use client';
import {useLayoutEffect,useRef} from 'react';
import {syncPlainText} from './lifecycle';

export default function EditableText({text,editable,onCommit,autoHeight=false}:{text:string;autoHeight?:boolean;editable:boolean;onCommit:(text:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 // No JSX children: browser edits and undo cannot invalidate React text fibers.
 useLayoutEffect(()=>{if(ref.current)syncPlainText(ref.current,text)},[text]);
 return <div ref={ref} translate="no" contentEditable={editable} suppressContentEditableWarning
  onPointerDown={e=>{if(editable)e.stopPropagation()}}
  onPaste={e=>{e.preventDefault();const selection=window.getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);if(!e.currentTarget.contains(range.commonAncestorContainer))return;range.deleteContents();const inserted=document.createTextNode(e.clipboardData.getData('text/plain'));range.insertNode(inserted);range.setStartAfter(inserted);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}}
  onBlur={e=>{if(!editable)return;const next=e.currentTarget.innerText;if(next!==text)onCommit(next);syncPlainText(e.currentTarget,next);}}
  style={{width:'100%',height:autoHeight?'auto':'100%',overflowWrap:autoHeight?'anywhere':undefined,outline:0}}/>;
}
