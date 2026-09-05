import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {projects} from '../app/data.ts';
const base=process.env.PORTFOLIO_BASE||'/a-form-portfolio/';
const output=process.env.PORTFOLIO_OUTPUT||'out';
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--base='+base,'--outDir='+output],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
writeFileSync(output+'/.nojekyll','');const shell=readFileSync(output+'/index.html','utf8').replace('</head>',process.env.VITE_STUDIO_MODE==='local'?'<meta name="robots" content="noindex,nofollow"/></head>':'</head>');writeFileSync(output+'/index.html',shell);writeFileSync(output+'/404.html',shell);
const escape=(value)=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const project of projects){
 const title=escape(project.name+' — A / FORM'),description=escape(project.description),image='https://miena1-a2.github.io/a-form-portfolio'+project.image;
 const page=shell.replace('<title>A / FORM — Independent Designer</title>',`<title>${title}</title>`).replaceAll('content="Independent explorations in brand identity, art direction and digital experience. A concept portfolio from Singapore."',`content="${description}"`).replaceAll('content="Independent explorations in brand identity, art direction and digital experience."',`content="${description}"`).replaceAll('content="A / FORM — Independent Designer"',`content="${title}"`).replaceAll('content="https://miena1-a2.github.io/a-form-portfolio/og.png"',`content="${image}"`);
 const dir=`${output}/work/${project.slug}`;mkdirSync(dir,{recursive:true});writeFileSync(`${dir}/index.html`,page);
}
for(const route of ['studio','studio-next']){const dir=`${output}/${route}`;mkdirSync(dir,{recursive:true});writeFileSync(`${dir}/index.html`,shell.replace('</head>','<meta name="robots" content="noindex,nofollow"/></head>'));}
