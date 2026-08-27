export const textLabels = {heroLine1:"首屏标题 · 第一行",heroLine2:"首屏标题 · 第二行",heroNote:"首屏注释",heroCaption:"首屏宣言",worksIntro:"作品区介绍",aboutHeading:"关于 · 标题",aboutBody:"关于 · 介绍",aboutSecond:"关于 · 补充说明",contactHeading:"联系区标题",contactBody:"联系区说明"};
export const projectFields = {name:"项目名称",category:"类别",role:"职责",year:"年份",description:"简介",narrative:"项目故事",statement:"视觉宣言",alt:"图片替代说明"};
export const slugs = ["phase-matter","tidal-index","after-signal","common-field"];
export const ranges = {headingScale:[0.65,1.15],tracking:[-0.09,0.02],lineHeight:[0.8,1.4],spacing:[0.6,1.6],bodySize:[12,22],duration:[0.1,2],distance:[0,80],hoverScale:[1,1.08],parallax:[0,1.5]} as const;
export type SiteContent={version:number;text:Record<keyof typeof textLabels,string>;design:{blue:string;paper:string;lime:string;headingScale:number;tracking:number;lineHeight:number;spacing:number;bodySize:number};motion:{enabled:boolean;duration:number;distance:number;hoverScale:number;parallax:number};projects:Record<string,Partial<Record<keyof typeof projectFields,string>>>};
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
export function validContent(value:unknown):value is SiteContent{
 if(!record(value)||value.version!==1||!record(value.text)||!record(value.design)||!record(value.motion)||!record(value.projects))return false;
 if(Object.keys(value).some(k=>!["version","text","design","motion","projects"].includes(k)))return false;
 if(Object.keys(value.text).length!==Object.keys(textLabels).length)return false;
 for(const k of Object.keys(textLabels)){const s=value.text[k];if(typeof s!=="string"||s.length>2000||!s.trim())return false;}
 for(const [group,keys] of [[value.design,["headingScale","tracking","lineHeight","spacing","bodySize"]],[value.motion,["duration","distance","hoverScale","parallax"]]] as const){for(const k of keys){const n=group[k];const [min,max]=ranges[k];if(typeof n!=="number"||!Number.isFinite(n)||n<min||n>max)return false;}}
 for(const k of ["blue","paper","lime"]){if(typeof value.design[k]!=="string"||!/^#[0-9a-f]{6}$/i.test(value.design[k]))return false;}
 if(Object.keys(value.design).length!==8||Object.keys(value.motion).length!==5||typeof value.motion.enabled!=="boolean")return false;
 for(const [slug,p] of Object.entries(value.projects)){if(!slugs.includes(slug)||!record(p))return false;for(const [k,s] of Object.entries(p)){if(!Object.hasOwn(projectFields,k)||typeof s!=="string"||s.length>2000||!s.trim())return false;}}
 return true;
}
