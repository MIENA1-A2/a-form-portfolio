import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {projects,getProject,profile} from "../app/data.ts";
import test from "node:test";
const root=fileURLToPath(new URL("../",import.meta.url));
test("four unique concept projects with complete content",()=>{
 assert.equal(projects.length,4);
 assert.equal(new Set(projects.map(p=>p.slug)).size,4);
 for(const p of projects){
  assert.match(p.slug,/^[a-z]+(?:-[a-z]+)+$/);
  for(const key of ["name","description","narrative","category","role","year","image","alt","statement"])assert.ok(p[key],p.slug+" missing "+key);
  assert.equal(getProject(p.slug),p);
 }
 assert.equal(getProject("not-a-project"),undefined);
});
test("all original artwork and share assets are present",async()=>{
 for(const p of projects)await access(root+"public"+p.image);
 await access(root+"public/images/hero-final.png");
 await access(root+"public/og.png");
});
test("Vite router defines project pages, titles and not-found handling",async()=>{
 const source=await readFile(root+"app/app.tsx","utf8");
 assert.match(source,/\/work\\\/\(\[\^\/\]\+\)/);
 assert.match(source,/Page not found — A \/ FORM/);
 assert.match(source,/document\.title/);
 const html=await readFile(root+"index.html","utf8");
 assert.match(html,/og:image/);
 const detail=await readFile(root+"app/project-detail.tsx","utf8");
 assert.match(detail,/variant=\{1\}/);
 assert.match(detail,/variant=\{2\}/);
});
test("local-only binding and responsive/reduced-motion safeguards are retained",async()=>{
 const config=await readFile(root+"vite.config.ts","utf8");
 assert.match(config,/host: '127.0.0.1'/);
 const css=await readFile(root+"app/globals.css","utf8");
 assert.ok(css.includes("prefers-reduced-motion:reduce"));
 assert.ok(css.includes("max-width:700px"));
 assert.ok(css.includes(":focus-visible"));
 const hero=await readFile(root+"app/hero.tsx","utf8");
 assert.ok(hero.includes("inView&&visible"));
 assert.ok(hero.includes("query.matches&&!reduced&&supported"));
});
test("project uses the pure React and Vite entrypoint",async()=>{
 const pkg=JSON.parse(await readFile(root+"package.json","utf8"));
 assert.equal(pkg.scripts.dev,"vite");assert.equal(pkg.dependencies.next,undefined);assert.equal(pkg.devDependencies.vinext,undefined);
 const main=await readFile(root+"main.tsx","utf8");assert.match(main,/createRoot/);
 const router=await readFile(root+"app/router.ts","utf8");assert.match(router,/pushState/);
});
test("Singapore clock configuration is valid",()=>{
 assert.equal(profile.timezone,"Asia/Singapore");
 assert.ok(new Intl.DateTimeFormat("en-GB",{timeZone:profile.timezone}).format(new Date()));
});
