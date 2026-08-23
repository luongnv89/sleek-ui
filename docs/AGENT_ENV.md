# Agent Environment Notes

What an executing agent needs to know to install, build, test, and validate this repo. Source of truth for the commands recorded in [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md).

## Toolchain

| Tool | Version |
|------|---------|
| Node.js | Pinned to **22** via `.nvmrc`; `package.json` `engines` requires `>=22 <23`. CI reads the same pin (`node-version-file: .nvmrc` in `.github/workflows/deploy.yml`). |
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

Pass rate at baseline: 69/69 (8 suites — recorded 2026-08-22; see issue #97). This is the documented baseline-green floor: later tasks must keep `npm test` at or above it. Current rate: 275/275 (28 suites, all passing — verified 2026-08-23 on Node 22 after the v2.0.0 test campaign).

Coverage (`npx jest --coverage`, re-measured 2026-08-23 after the v2.0.0 test expansion): global statements 91.69%, branches 84.21%, functions 92.45%, lines 92.48%. `coverageThreshold` in `jest.config.cjs` guards a floor below these numbers; ratchet upward as coverage improves.

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
