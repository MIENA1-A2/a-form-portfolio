import {spawnSync} from 'node:child_process';
for(const [mode,base,output] of [['cloud','/a-form-portfolio/','out'],['local','/a-form-portfolio/preview/','out/preview']]){
 const result=spawnSync(process.execPath,['scripts/build-pages.mjs'],{stdio:'inherit',env:{...process.env,VITE_STUDIO_MODE:mode,PORTFOLIO_BASE:base,PORTFOLIO_OUTPUT:output}});
 if(result.status!==0)process.exit(result.status||1);
}
