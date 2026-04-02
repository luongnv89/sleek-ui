# Architecture

sleek-ui is a static React single-page app deployed to GitHub Pages. There is no backend — all design data is served as static JSON files.

## System Overview

```
Browser
  │
  ├── React SPA (HashRouter)
  │     ├── HomePage          — landing, hero, catalog grid
  │     └── DesignDetail      — per-design tokens, agent prompt, apply button
  │
  ├── ThemeContext             — applies design CSS vars to :root / localStorage
  └── AppliedDesignBanner     — persistent bottom bar for active design
```

## Data Flow

```
public/designs/{slug}.json   ←── curated JSON files (static assets)
src/data/designs/{slug}.json ←── same files bundled into the Vite build

designs.ts (runtime transform)
  └── TransformedDesign[]     ←── slug, jsonUrl, colors, thumbnailUrl, rawData

DesignDetail
  └── rawData: DesignData     ─→ ThemeContext.applyDesign()
                                     └── buildCssVars() → <style> injection
                                     └── loadFonts()    → <link> injection
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Root component, routing, `HomePage` |
| `src/components/DesignDetail.tsx` | Design page with token table and apply button |
| `src/context/ThemeContext.tsx` | CSS variable injection and localStorage persistence |
| `src/data/designs.ts` | Transforms raw JSON into `TransformedDesign` |
| `public/designs/` | Static JSON served by GitHub Pages (agent-fetchable) |
| `public/schema/design.v1.json` | JSON Schema for design files |
| `scripts/validate-designs.js` | Schema validation script |
| `.github/workflows/deploy.yml` | GitHub Pages CI/CD |

## Design JSON Schema

Each design is a self-contained JSON file with:

- `tokens.colors.light / dark` — HSL CSS custom properties (shadcn format)
- `tokens.typography` — font families, sizes, weights
- `tokens.radius` — border radius scale
- `fonts.urls` or `fonts.google` — font loading instructions
- `agentInstructions.steps` — ordered steps for AI agents to apply the design
- `accessibility.focusRing` — focus state specification

See [`public/schema/design.v1.json`](../public/schema/design.v1.json) for the full schema.

## Deployment

GitHub Actions builds with `vite build` on every push to `main` and deploys `dist/` to the `gh-pages` branch. The custom domain `luongnv.com/sleek-ui` points to this via CNAME.

Static `public/` files (design JSONs, logos, video) are copied into `dist/` by Vite and served with GitHub Pages' default CORS headers (`Access-Control-Allow-Origin: *`).
