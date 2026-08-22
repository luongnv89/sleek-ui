# Router Decision: HashRouter kept on react-router-dom v7

**Date:** 2026-08-22
**Issue:** [#111](https://github.com/luongnv89/sleek-ui/issues/111) — Major upgrade react-router-dom 6 to ^7.x
**Decision:** Keep `HashRouter`; do **not** migrate to `BrowserRouter` as part of the v7 upgrade.

## Context

sleek-ui is a single-page React app deployed via GitHub Pages at
`https://luongnv.com/sleek-ui/`. GitHub Pages serves static files only and has
no SPA rewrite rule: any path other than `/sleek-ui/` (or a real file) returns
a plain `404 Not Found` instead of `index.html`.

## Options considered

| Option | Outcome |
|--------|---------|
| **Keep HashRouter** ✅ | All routes live under `/#/…`, so every deep link resolves to `/sleek-ui/index.html` and is served correctly. No server config needed. |
| Migrate to BrowserRouter + 404.html trick | Possible (copy `index.html` → `404.html`, parse the real path client-side), but adds a hacky redirect layer and changes all URLs. |
| Migrate to BrowserRouter alone | Breaks: deep links like `/sleek-ui/designs/foo` would 404 on GitHub Pages, breaking shared design links — the product's core flow. |

## Consequences

- The Task 1.5 / #104 `scrollIntoView` in-page-anchor workaround remains
  necessary: with `HashRouter`, plain `#section` hrefs would collide with the
  router's hash, so in-page navigation uses buttons calling
  `scrollIntoView({ behavior: 'smooth' })`. This workaround would only become
  obsolete if the app ever moves off GitHub Pages or adopts the 404.html
  approach.
- URLs remain of the form `/sleek-ui/#/designs/{slug}`.

## Upgrade notes (v6 → v7)

- Declarative mode (`<HashRouter>`, `<Routes>`, `<Route>`) is fully supported
  in v7; no component changes were required.
- `react-router-dom@7` re-exports from the unified `react-router` package;
  existing imports continue to work unchanged.
- Jest/jsdom needed an explicit `TextEncoder`/`TextDecoder` global polyfill
  (added in `jest.setup.cjs`) because react-router v7 references them at module
  load time.
- Requires Node >= 20 and React >= 18 — both satisfied (React stays on 18
  until #113).
