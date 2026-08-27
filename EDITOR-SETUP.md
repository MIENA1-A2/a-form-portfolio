# A / FORM Studio

Editor: https://miena1-a2.github.io/a-form-portfolio/studio/

API: https://aform-studio-api.2975166565.workers.dev

## One-time GitHub login setup

1. Open https://github.com/settings/applications/new and create an OAuth App named **A FORM Studio**.
2. Homepage URL: `https://miena1-a2.github.io/a-form-portfolio/studio/`.
3. Authorization callback URL: `https://aform-studio-api.2975166565.workers.dev/auth/callback`.
4. Generate a client secret. In Cloudflare → Workers & Pages → aform-studio-api → Settings → Variables and Secrets, add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as **Secret** values. Deploy the settings change. Do not commit these values or send them in chat.
5. Open `/health` on the API. It returns `{"ready":true}` when all three required secrets exist. The encryption secret `SESSION_KEY` is provisioned separately during initial installation.
6. Open Studio, sign in with the owning GitHub account and authorize the OAuth app. It requests `public_repo`, the OAuth scope required to update public repositories. Although GitHub grants this scope for public repositories, this backend hardcodes a single repository and a single JSON file; it does not offer arbitrary repository/file writes.

## Editing

The editor reuses the public site's components inside an iframe. It sends only validated content to a same-origin preview. Choose Home or a project, change text, layout or animation controls, switch desktop/tablet/mobile preview, and replay animation. System reduced-motion preferences take priority.

Save draft stores an encrypted private cloud draft. Draft saves are explicit and last-save-wins across devices; they do not publish. Restore keeps the original file version so conflicting changes cannot silently overwrite newer content. Unsaved changes are memory-only. Sign in again after refreshing or after the one-hour session expires.

Sync and publish updates only `app/site-content.json` on `main`. GitHub's SHA precondition prevents stale overwrites. The normal Pages workflow builds the source; publication is asynchronous. The “发布进度” link shows the actual build result. GitHub commit history can restore an older version of the JSON file.

## Security and limits

- API validates the numeric owner GitHub ID on every data request, with strict Origin checks and bearer sessions.
- OAuth uses state, a Secure/HttpOnly/SameSite cookie, PKCE, a fixed callback, and an owner allowlist.
- GitHub tokens never reach browser storage. Temporary sessions and drafts are AES-GCM encrypted in dedicated KV storage, using a Worker secret. Session identifiers are hashed in storage and expire after one hour.
- KV is eventually consistent; logout revocation may take time to propagate. Session expiration is independently checked by the server.
- Text is rendered by React, not injected as HTML. Only allowlisted fields and bounded numerical/color parameters are accepted; arbitrary code, CSS, URLs and file paths cannot be submitted.
- OAuth requests are made only to GitHub, and authentication callback responses are non-cacheable with a restrictive CSP.
- A missing secret fails closed. The editor may be publicly loaded, but the server does not allow unauthenticated reads of drafts or writes.
- `SESSION_KEY` rotation invalidates existing encrypted sessions **and drafts**. Do not rerun `scripts/set-session-key.mjs` casually.

## Source and validation

`app/studio/`: UI; `app/content.tsx`: shared preview context; `app/content-schema.ts`: validation shared with the Worker; `worker/index.ts`: backend; `worker/wrangler.jsonc`: non-secret deployment config.

Run `npm test`, `npm run build:pages`. For Worker types, create ignored `worker/.dev.vars` with the three secret key names and empty values, then run `npx wrangler types worker/worker-configuration.d.ts --config worker/wrangler.jsonc` and `npx tsc -p worker/tsconfig.json`. Deploy explicitly with `npx wrangler deploy --config worker/wrangler.jsonc`. The frontend workflow does not redeploy the backend.

Tests cover schema validation, request size limits, unauthenticated and wrong-origin denial, owner allowlist, encrypted drafts, version conflicts and fixed-file publication with a mocked GitHub API. Real OAuth and authenticated end-to-end publishing require the one-time setup above and must still be verified with the owner account. No claims of completed browser interaction or device screenshot QA are made.
