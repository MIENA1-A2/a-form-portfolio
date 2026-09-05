import react from '@vitejs/plugin-react';
import {sites} from '@openai/sites-vite-plugin';
import {defineConfig} from 'vite';
import {realpathSync} from 'node:fs';
export default defineConfig({server:{host: '127.0.0.1',port:3002,strictPort:true,fs:{allow:[process.cwd(),realpathSync('node_modules')]},watch:{usePolling:process.platform==='win32',interval:500}},plugins:[react(),sites()],build:{outDir:'dist',target:'es2022'}});
