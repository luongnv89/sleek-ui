# Changelog

All notable changes to sleek-ui are documented here. This is the single
authoritative release record — `RELEASE.md` cross-links here and must not
duplicate entries.

## [Unreleased]

### Added
- 60-design catalog: 5 original hand-crafted systems, 54 brand-inspired design
  systems (Airbnb, Apple, Stripe, Vercel, and more), and a glassmorphic system
- Generated SVG thumbnails for every catalog design
  (`scripts/generate-thumbnails.js`) — zero thumbnail 404s
- Design-extractor agent skill for extracting new design systems from URLs or
  screenshots
- `ThemeContext` — apply any design system live to the catalog via CSS variable
  injection; `AppliedDesignBanner` persistent active-design bar with reset
- `LogoMark` SVG component (inline, `currentColor`)

### Changed
- Landing page improved with StoryBrand narrative, responsive mobile nav, and
  design polish
- Single-source catalog registry with testable design transform
- Deploy pipeline gated on lint, typecheck, tests, and design validation
- Bundle performance: lazy-loaded design data and route splitting
- License updated from ISC to Apache 2.0; `package.json` metadata expanded
- Migrated domain from `luongnv89.github.io/sleek-ui` to `luongnv.com/sleek-ui`

## [1.0.0] — 2026-03-27

Phase 2 — Full MVP Launch. Tag: `v1.0.0`, GitHub Release created.

### Added
- Full landing page redesign with AIDA copywriting framework
- Hero section with grid background, green glow, and agent compatibility badges
- "How it works" 3-step section with copy-ready agent prompt block
- Promotional video on landing page

## [0.1.0] — 2024

### Added
- Initial catalog with 5 hand-crafted design systems (Editorial Dark, Warm SaaS, Neo Brutalist, Swiss Clean, Deep Ocean)
- `design.v1.json` schema
- GitHub Pages deployment via GitHub Actions
- Schema validation script
- Agent prompt template

[Unreleased]: https://github.com/luongnv89/sleek-ui/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/luongnv89/sleek-ui/releases/tag/v1.0.0
[0.1.0]: https://github.com/luongnv89/sleek-ui/releases/tag/v0.1.0
