import {useState} from 'react';
import {readHistory} from './assets';
import {validDocument,type Document} from './document';
export default function HistoryControls({onRestore}:{onRestore:(doc:Document)=>void}){
 const [entries,setEntries]=useState<Array<{time:string;document:unknown}>>([]),[message,setMessage]=useState('');
 return <div><button onClick={()=>void readHistory().then(values=>{setEntries(values.reverse());setMessage(values.length?'最近十次保存，可撤销恢复操作':'暂无历史版本');}).catch(()=>setMessage('读取历史失败，请导出当前文档备份'))}>查看本机历史</button><p role="status">{message}</p>{entries.map((entry,i)=><button key={entry.time+i} onClick={()=>{if(validDocument(entry.document)&&confirm('恢复这份历史文档？当前画布仍可撤销恢复。'))onRestore(entry.document)}}>恢复 {new Date(entry.time).toLocaleString()} · {i+1}</button>)}</div>;
}
