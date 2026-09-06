import {validDocument,type Document} from './document';
export type RefreshIssue='network'|'http'|'invalid'|null;
// Only the unauthenticated public endpoint is read. Never use editor storage here.
export async function refreshPublicDocument(fallback:Document,signal:AbortSignal,request:typeof fetch=fetch):Promise<{document:Document;issue:RefreshIssue}>{
 try{
  const response=await request('https://aform-studio-api.2975166565.workers.dev/v2/published',{cache:'no-store',signal});
  if(!response.ok)return {document:fallback,issue:'http'};
  const data:unknown=await response.json();
  if(!data||typeof data!=='object'||!('document' in data))return {document:fallback,issue:'invalid'};
  if(data.document===null)return {document:fallback,issue:null};
  return validDocument(data.document)?{document:data.document,issue:null}:{document:fallback,issue:'invalid'};
 }catch{return {document:fallback,issue:'network'};}
}
