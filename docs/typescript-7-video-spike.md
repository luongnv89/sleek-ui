# TypeScript 5.4 → 7.0 upgrade spike for `video/` (issue #112)

Upgraded the isolated `video/` package's devDependency from
`typescript@^5.4.0` to `typescript@^7.0.2` (7.0.2 is the latest stable at
the time of writing; TypeScript 7 is the native Go port announced in
[Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)).

## Config/CLI changes in TS 7 affecting `video/tsconfig.json` and CI

TS 7 adopts 6.0's defaults and turns 6.0 deprecations into hard errors.
Audit of every option this repo uses:

| Option in use | TS 7 status |
|---------------|-------------|
| `moduleResolution: "bundler"` | Still supported (`node`/`node10`/`classic` are hard errors) ✓ |
| `module: "ESNext"` | Now the default; still valid ✓ |
| `target: "ES2020"` | Valid (only ES5 was removed) ✓ |
| `esModuleInterop: true` | Required — cannot be set to `false` anymore ✓ |
| `strict: true` | Now the default ✓ |
| `declaration`, `declarationMap`, `noEmit` | Unchanged behavior ✓ |

New defaults that did **not** require changes here:

- `types` now defaults to `[]` — `video/src` imports all ambient types
  explicitly (`@types/react` via imports), no global-type reliance.
- `rootDir` now defaults to `./` with inner dirs explicit — harmless under
  `noEmit`.

New CLI flags (`--checkers`, `--builders`, `--singleThreaded`) are optional;
the CI typecheck job uses plain `tsc --noEmit` with defaults. One CLI
behavioral change worth noting: `tsc` refuses file-path arguments when a
`tsconfig.json` exists in the cwd unless `--ignoreConfig` is passed — not
relevant to our `npm run typecheck` script.

## Verification

- `(cd video && npx tsc --noEmit)` exits **0** on typescript 7.0.2 with zero
  tsconfig changes.
- The `video-typecheck` GitHub Actions job (`.github/workflows/deploy.yml`)
  needed no structural change — it installs from `video/package-lock.json`
  (which now pins 7.0.2) and runs the same script.
- Root `npm test` baseline holds.

## Why root stays on TypeScript 6

The issue asked to bump root's `typescript` devDependency in the same pass
if compatible. It is **not**: TypeScript 7.0 ships **no programmatic API**
(API returns in 7.1), and `typescript-eslint@^8.67.0` imports `typescript`
directly via peer dependency. Verified empirically — with root on 7.0.2,
`npm run lint` fails immediately:

```
Error: typescript-eslint does not support TS 7.0.
```

This matches Microsoft's own migration guidance to run TypeScript 6
side-by-side (via the `@typescript/typescript6` package) for tools that need
the compiler API. Root therefore remains at `^6.0.3`; revisit when
typescript-eslint gains TS 7 support (expected around TS 7.1).
