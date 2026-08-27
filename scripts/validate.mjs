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
test("route defines project-specific metadata and not-found handling",async()=>{
 const source=await readFile(root+"app/work/[slug]/page.tsx","utf8");
 assert.match(source,/generateMetadata/);
 assert.match(source,/if\(!project\)notFound\(\)/);
 assert.ok(source.includes("images:[assetPath(p.image)]"));
 assert.match(source,/variant=\{1\}/);
 assert.match(source,/variant=\{2\}/);
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
test("Singapore clock configuration is valid",()=>{
 assert.equal(profile.timezone,"Asia/Singapore");
 assert.ok(new Intl.DateTimeFormat("en-GB",{timeZone:profile.timezone}).format(new Date()));
});
