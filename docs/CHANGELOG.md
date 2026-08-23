# Changelog

All notable changes to sleek-ui are documented here. This is the single
authoritative release record — `RELEASE.md` cross-links here and must not
duplicate entries.

## [2.0.0] — 2026-08-23

Major release: 96 commits since v1.0.0 — toolchain upgraded across the board,
catalog expanded, CI quality gates hardened.

### Upgrade Notes

No breaking API changes are expected, but the toolchain moved up a major
version across the board:

- React / React DOM upgraded 18 → 19 (#156, #113)
- Tailwind CSS migrated 3 → 4 via the Vite plugin (#158, #115)
- Vite upgraded 5 → 8 (#157, #114)
- react-router-dom upgraded to v7 (#154, #111)
- tailwind-merge upgraded 2.6 → 3.x (#153, #110)
- lucide-react upgraded to ^1.33.0 (#152, #109)
- video/ TypeScript upgraded to ^7.0.2 (#155, #112)

Projects consuming sleek-ui designs as JSON are unaffected.

### Added

- Redesigned landing page with AIDA copywriting framework (#69) and StoryBrand narrative with responsive mobile nav (@Luong NGUYEN)
- Design catalog on the landing page with color system, global styles, DesignCard and TokenTable components (#90, #59)
- DesignDetail page with light/dark toggle and copy actions (#64), plus utility components (#63)
- 54 brand designs with real colors, color swatch previews, and functional search/filter
- New designs: glassmorphic (#76), swiss-clean & deep-ocean (#66/#36), neo-brutalist (#54), warm-saas (#13)
- Generated SVG thumbnails for every catalog design (`scripts/generate-thumbnails.js`) — zero thumbnail 404s
- `ThemeContext` — apply any design system live to the catalog via CSS variable injection; `AppliedDesignBanner` persistent active-design bar with reset
- `LogoMark` SVG component (inline, `currentColor`)
- Before/after screenshots gallery for all designs (#67/#37)
- Dark/light mode theme toggle (#73, #68)
- design-extractor agent skill (#72, #71)
- 4K (3840×2160) promotional video render, scaling all elements 2x
- Open Graph and Twitter Card SEO meta tags (#87, #80)
- Social proof and founder presence landing sections (#90, #79, #82)

### Fixed

- WCAG AA contrast ratios in warm-saas and neo-brutalist designs (#56); additional warm-saas contrast and color duplication issues; catalog records and missing thumbnails (#178, #143)
- Routing gaps and content correctness in UI flows (#176, #141, #140)
- Accessibility interactions — ARIA attributes and hit targets (#173, #139)
- Consolidated clipboard feedback into shared `useClipboard` hook (#165, #132)
- Hardened ingest fetching and added pipeline fixture tests (#161, #121)
- Validated design JSON before context injection; guarded storage writes (#146, #102, #103)
- Replaced in-page hash anchors with `scrollIntoView` nav buttons (#147, #104)
- Scroll to top when opening design detail; compacted tokens section (#78, #77)
- Bundled design data instead of fetching it, resolving CORS errors; fixed logo paths for custom domain; fixed missing cva import in badge.tsx; fixed JSON import paths; followed redirects in CORS verification check; renamed App.jsx → App.tsx fixing build error
- Migrated domain from `luongnv89.github.io/sleek-ui` to `luongnv.com/sleek-ui`
- De-flaked tests and removed module-scope nondeterminism (#168, #124)
- Reconciled video dead-twin frame math; single-sourced the agent prompt (#167, #127, #130)

### Performance

- Lazy-loaded design data, route splitting, and compression (#175, #135, #136)
- Deferred hero video load and memoized hot paths (#174, #137)
- Concurrency-capped parallel fetch of design files in ingest script (#172, #138)

### Documentation

- Aligned docs with code — counts, previews, statuses (#177, #142)
- Documented agent environment and aligned agent config files (docs/AGENT_ENV.md) (#144)
- Recorded baseline test pass rate in env docs (#149, #97)
- Documented `tailwindConfig` override field decision (#38)
- Multi-agent usage guide and quirks documentation (#57); agent loop test docs for Codex CLI (#52) and Claude Code (#51); CLAUDE.md project documentation (#1); social launch documentation and README; RELEASE.md for v1.0.0 (#45)
- Updated README with logo, punchy tagline, landing-page layout, and theme-aware logo (dark/light mode)

### Dependencies

- Major upgrades: React 19 (#156), Vite 8 (#157), Tailwind CSS 4 (#158), react-router-dom 7 (#154), tailwind-merge 3 (#153), lucide-react 1.33 (#152), video/ TypeScript 7 (#155)
- Patch/minor dependency batch + CSP metas + pre-commit hooks (#148, #105, #106)
- Security: patched root and video/ advisories (wave W1) (#145, #100, #101)
- Slop cleanup — pruned unused deps, removed unused code, consolidated types (#74)

### Changed

- CI/CD: gated deploys on lint, typecheck, tests, and design validations (#150, #98, #99); pinned Node 22 everywhere and added video/ typecheck job (#151, #107); hardened CI with CORS check and workflow badge (#58); set up GitHub Actions deploy workflow and CORS verification docs (#50, #49)
- Refactors: decomposed HomePageInner god component into sections (#170, #128) and DesignDetail into smaller components while fixing stale-design navigation (#166, #129); component hygiene — brand token, PascalCase ui/, GithubIcon, coverage ratchet (#171, #134); single-source catalog registry with testable transform (#160, #125); split convertToSleekUi into pure helpers (#162, #131); rewrote footer closing line with bold CTA (#91, #85); moved pain section before video, dropped redundant success card (#89, #83, #86); rewrote hero headline to a single CTA (#88, #81, #84); removed dead code per DEAD inventory report (#169, #126)
- Tests: characterization tests covering DesignDetail, contexts, and ui components (#163, #117); error/edge-path guards for latent bugs plus clipboard rejection coverage (#164, #123); enabled Jest coverage collection with committed thresholds (#159, #116); fixed schema validation tests to match design.v1.json schema (#60, #61)
- Infra & community: Apache 2.0 license and OSS community files (#70); JSON schema validation tooling (#47); ugly demo app for agent loop test (#48); social launch documentation and README

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

[Unreleased]: https://github.com/luongnv89/sleek-ui/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/luongnv89/sleek-ui/releases/tag/v2.0.0
[1.0.0]: https://github.com/luongnv89/sleek-ui/releases/tag/v1.0.0
[0.1.0]: https://github.com/luongnv89/sleek-ui/releases/tag/v0.1.0
