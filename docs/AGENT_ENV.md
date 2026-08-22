# Agent Environment Notes

What an executing agent needs to know to install, build, test, and validate this repo. Source of truth for the commands recorded in [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md).

## Toolchain

| Tool | Version |
|------|---------|
| Node.js | CI pins **20** (`.github/workflows/deploy.yml` — EOL since April 2026, upgrade pending); local dev is **unpinned** (v26.7.0 observed at time of writing). No `engines` field or `.nvmrc` exists. |
| npm | 11.x observed locally; any npm ≥ 10 with lockfile v3 support works. |

Commands may fail on a fresh machine until Task 0.1 restores a green toolchain; the commands below are the record of intent.

## Commands of record

Run all root commands from the repo root:

```bash
npm ci                    # Install exact dependencies from package-lock.json
npm run build             # Production build (vite build → outputs to dist/)
npm test                  # Run Jest 30 unit tests
npm run validate:designs  # Validate public/designs/*.json against design.v1.json schema
npm run dev               # Vite dev server
```

### Tests

- Runner: **Jest 30** (`jest.config.cjs`, jsdom environment).
- Test locations: `src/**/*.test.{ts,tsx}` and `tests/**/*.test.js`.
- Setup file: `jest.setup.cjs`.

### Design validation

- Script: `scripts/validate-designs.js` (ajv + ajv-formats against `public/schema/design.v1.json`).
- Runs in CI before every deploy — keep it green.

## Nested package gotcha

**IMPORTANT:** `video/` is a self-contained Remotion project with its own `package.json` and `package-lock.json`. Root installs do NOT install it:

```bash
npm ci              # root (app + tests)
cd video && npm ci  # only if working on the promo video
```

Never commit `node_modules/` from either location.

## Build output

- Vite builds to **`dist/`** (default). GitHub Actions uploads `./dist` as the Pages artifact.
- The `base` path is `/sleek-ui/` (set in `vite.config.js`) — do not remove it.
