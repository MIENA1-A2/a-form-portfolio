// Generates the encryption key in memory and sends it directly to Wrangler.
// Run once during initial setup; rotating it invalidates existing sessions/drafts.
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk','--config','worker/wrangler.jsonc'],{input:JSON.stringify({SESSION_KEY:randomBytes(32).toString('hex')}),stdio:['pipe','inherit','inherit']});
process.exitCode=result.status??1;
