# Visual Studio: cloud sync and live publication

The GitHub Pages frontend remains at `/a-form-portfolio/`; the workbench is
`/studio-next/`. The existing Cloudflare Worker handles the existing owner-only
GitHub OAuth flow. No new secrets or OAuth callbacks are required.

## Use

1. Open Visual Studio and sign in with the allowed GitHub account.
2. The latest cloud draft loads. If this device has unsynced edits, choose which
   version to keep; export a backup before replacing either version.
3. Stop editing for three seconds to save a cloud draft. Another signed-in device
   loads it on login, or checks every twenty seconds while its canvas is clean.
4. `发布当前画布` saves and publishes the whole document. Enabling
   `自动更新线上` publishes after each debounced save. The switch starts OFF in
   every session and explicitly warns that the public layout will be replaced.
5. Visitors opening or refreshing the public portfolio receive the published
   layout, images and effects. Existing visitor tabs are not forcibly reloaded.
6. `切回原作品集` disables the live document; the cloud draft is retained.

The new canvas is an editable redesign, not a pixel-exact migration of the old
portfolio. Review desktop, tablet and mobile previews before first publishing.
Original content stays in GitHub, and the old editor remains available. While a
visual document is published, it takes precedence over old-editor changes.

## Data and security

- GitHub stores application source; visual drafts and live content are stored in
  Cloudflare, not committed to the public repository on every keystroke.
- `VISUAL` is a SQLite-backed Durable Object per portfolio owner. Draft and
  published slots are separate. Documents including embedded image assets are
  chunked into bounded SQL rows. The current document limit is 16 MB; requests
  are also bounded by bytes. Export JSON for a portable backup.
- Every private read/write verifies the existing session and GitHub numeric
  owner ID. Sessions stay in memory in the browser and expire after one hour.
- `/v2/published` is the only anonymous document endpoint and never reads drafts.
- Save/publish check the draft revision and update all rows in one synchronous
  transaction. Stale writes receive 409. Network failures pause automatic
  publishing and retain the local canvas; ambiguous writes require cloud reload.
- Unpublishing advances the revision, so an old device cannot republish silently.
- Runtime document reads use `no-store`. If the backend is unavailable, the
  original statically exported portfolio remains the fallback.
- Static HTML/share metadata remain the original GitHub build metadata; live
  canvas edits update the rendered pages, not social crawler metadata.

## Deploy / validate

`npm test` includes Miniflare integration tests with mocked GitHub identity and
isolated local storage: auth/CORS, private draft isolation, concurrent revision
conflicts, publish/unpublish and image payloads above 2 MB. No production content
is written by tests. The pinned test runtime uses compatibility date 2026-05-22;
production retains its existing 2026-08-27 date.

Run `npx wrangler types --config worker/wrangler.jsonc worker/worker-configuration.d.ts`,
`npx tsc -p worker/tsconfig.json`, `npm test`, and `npm run build:pages`.
Deploy backend with `npx wrangler deploy --config worker/wrangler.jsonc --keep-vars`
to preserve dashboard variables and existing secrets. The `visual-v1` migration
adds `VisualStore`; it does not change existing OAuth/session KV data.
Push validated source to `main` to deploy GitHub Pages.

References: [Cloudflare SQLite storage and transactions](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/),
[Workers RPC limits](https://developers.cloudflare.com/workers/runtime-apis/rpc/).
