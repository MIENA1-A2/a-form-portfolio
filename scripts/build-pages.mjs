import {spawnSync} from "node:child_process";
import {writeFileSync} from "node:fs";
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  stdio: "inherit",
  env: {...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_BASE_PATH: "/a-form-portfolio", NEXT_TELEMETRY_DISABLED: "1"},
});
if (result.status !== 0) process.exit(result.status || 1);
writeFileSync("out/.nojekyll", "");
