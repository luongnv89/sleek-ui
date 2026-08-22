# Development Tasks: sleek-ui

**Generated from:** `prd.md` v1.0.0
**Generated on:** 2026-03-26
**Total tasks:** 38
**Sprints:** 4

---

## Quick Reference

| Sprint | Phase | Focus | Tasks | Status |
|--------|-------|-------|-------|--------|
| Sprint 1 | POC | Agent loop proof — schema + 1 design + ugly demo app | 9 | ✅ |
| Sprint 2 | MVP Foundation | 3 designs + CI/CD + CORS verification | 10 | ✅ |
| Sprint 3 | MVP Completion | Catalog website (home + detail) + verified loop | 11 | ✅ |
| Sprint 4 | Full Features | 2 more designs + before/after + launch | 8 | ✅ |

> All four sprints are complete: the catalog is live at luongnv.com/sleek-ui,
> deploys via GitHub Actions on every push to `main`, and the catalog holds
> 60 schema-valid designs (`npm run validate:designs`).

---

## Sprint 1 — POC: Prove the Loop Works

**Goal:** A single AI agent successfully re-skins the demo app using a design JSON URL. Validates the core hypothesis.
**Duration:** ~5 days
**Exit criteria:** Agent loop verified end-to-end with Editorial Dark.

---

### Task 1.1: Initialize Vite + React + Tailwind + shadcn project

**Description:** Scaffold the repository with the correct tech stack. The catalog website requires Vite 5, React 18, TailwindCSS v3, and shadcn/ui. Initialize with hash router and GitHub Pages base path configured.

**Acceptance Criteria:**
- [ ] `package.json` has `vite`, `react`, `react-dom`, `tailwindcss`, `shadcn/ui`, `react-router-dom`
- [ ] `vite.config.js` has `base: '/sleek-ui/'` for GitHub Pages
- [ ] `tailwind.config.js` is set up with shadcn content paths
- [ ] `src/App.jsx` uses `HashRouter` from `react-router-dom`
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds and produces `/dist`

**Dependencies:** None

**PRD Reference:** §6.2 Frontend Specifications

---

### Task 1.2: Define `design.v1.json` JSON Schema

**Description:** Create the formal JSON Schema (Draft 7) that all design files must validate against. This is the core format spec. File lives at `public/schema/design.v1.json` and is served at a stable URL.

**Acceptance Criteria:**
- [ ] Schema at `public/schema/design.v1.json`
- [ ] Validates all required top-level fields: `$schema`, `name`, `version`, `description`, `categories`, `author`
- [ ] `tokens.colors.light` and `tokens.colors.dark` each require all 17 semantic color role properties
- [ ] `tokens.typography`, `tokens.spacing`, `tokens.radius`, `tokens.shadows` sections defined
- [ ] `fonts.google[]` and `fonts.urls[]` arrays defined
- [ ] `accessibility` object with `contrastTarget`, `focusRing`, `reducedMotion` required
- [ ] `components.button` (primary, secondary, ghost), `components.card`, `components.input` defined
- [ ] `agentInstructions.steps[]` is a required array of strings
- [ ] `preview.thumbnail` and `preview.screenshots.light/dark` defined
- [ ] A valid design JSON validates; an empty `{}` fails validation

**Dependencies:** None

**PRD Reference:** §3.2 F01, §6.3

---

### Task 1.3: Author `editorial-dark.json` design file

**Description:** Hand-craft the first design file — "Editorial Dark" — following the confirmed token values in the PRD. This is the primary design used for the POC agent loop test.

**Acceptance Criteria:**
- [ ] File at `public/designs/editorial-dark.json`
- [ ] Passes JSON schema validation (Task 1.2)
- [ ] `tokens.colors.dark.background` = `"240 33% 14%"`, `primary` = `"245 90% 73%"`
- [ ] `tokens.colors.light` complete set present
- [ ] `fonts.urls` contains working Google Fonts URL for Inter + JetBrains Mono
- [ ] `agentInstructions.steps` contains all 7 steps from PRD §3.2 F01
- [ ] `defaultMode` = `"dark"`
- [ ] `categories` = `["dark", "minimal"]`
- [ ] Preview paths set: `/previews/editorial-dark-thumb.png`, light/dark screenshots

**Dependencies:** Task 1.2

**PRD Reference:** §3.2 F02, Phase 1 design table

---

### Task 1.4: Set up JSON schema validation tooling

**Description:** Add a validation script so all design JSONs in `public/designs/` are validated against the schema on every change. Prevents shipping invalid designs.

**Acceptance Criteria:**
- [ ] `ajv` or `ajv-cli` added as dev dependency
- [ ] `npm run validate:designs` script validates all `public/designs/*.json` against `public/schema/design.v1.json`
- [ ] Script exits non-zero if any design fails validation
- [ ] Pre-commit hook (husky or simple `.git/hooks/pre-commit`) runs `npm run validate:designs`
- [ ] Test: temporarily break editorial-dark.json → script fails; fix → passes

**Dependencies:** Task 1.2, Task 1.3

**PRD Reference:** §6.6 JSON Schema Validation

---

### Task 1.5: Build the "ugly" demo app

**Description:** Create a standalone "before" app in `demo-app/`. Plain HTML + vanilla CSS + minimal JS, intentionally styled with browser defaults and generic gray CSS. This is the target for the agent loop test.

**Acceptance Criteria:**
- [ ] File at `demo-app/index.html` (single self-contained file, or minimal multi-file)
- [ ] Layout includes: sidebar nav, ≥ 4 stats cards, 1 data table (with at least 5 rows), 1 settings form
- [ ] Styled with browser defaults only — no design framework, no custom colors beyond basic gray
- [ ] Uses system fonts (no Google Fonts)
- [ ] ≥ 5 distinct UI component types visible (nav link, card, table row, button, input)
- [ ] NOT part of Vite build — can be opened as `file://` or `http-server .`
- [ ] Renders correctly without a build step

**Dependencies:** None (can run in parallel with Tasks 1.2–1.4)

**PRD Reference:** §3.2 F06

---

### Task 1.6: Verify GitHub Pages CORS

**Description:** Before the agent loop test, verify that GitHub Pages serves the design JSON files with `Access-Control-Allow-Origin: *`. This is a hard prerequisite for the core hypothesis.

**Acceptance Criteria:**
- [ ] Deploy a test JSON to GitHub Pages (can be editorial-dark.json after Task 1.7)
- [ ] Run from browser console: `fetch('https://luongnv.com/sleek-ui/designs/editorial-dark.json').then(r => r.json()).then(console.log)` — succeeds
- [ ] Confirm response header: `Access-Control-Allow-Origin: *`
- [ ] Document result in README `docs/cors-verification.md`
- [ ] Fallback plan documented: "if CORS fails, move to Cloudflare Pages (zero code changes)"

**Dependencies:** Task 1.7 (initial deploy)

**PRD Reference:** §3.2 F03, §6.5 Infra, Risk table

---

### Task 1.7: Set up GitHub Actions CI/CD (Phase 1 minimal)

**Description:** GitHub Actions workflow that builds the Vite site and deploys to `gh-pages` branch on every push to `main`. Minimal config — just enough to get designs live at stable URLs for the agent loop test.

**Acceptance Criteria:**
- [ ] `.github/workflows/deploy.yml` created
- [ ] Triggers on push to `main`
- [ ] Steps: checkout → `npm ci` → `npm run validate:designs` → `npm run build` → deploy to `gh-pages`
- [ ] Uses `peaceiris/actions-gh-pages` or `JamesIves/github-pages-deploy-action`
- [ ] `public/designs/` files are included in the deployed `/dist`
- [ ] After push, `https://luongnv.com/sleek-ui/designs/editorial-dark.json` returns 200

**Dependencies:** Task 1.1, Task 1.4

**PRD Reference:** §6.5 Infra, §8.1 Milestone 1.11

---

### Task 1.8: Agent loop test — Claude Code

**Description:** Execute the core hypothesis test. Feed the editorial-dark.json URL to Claude Code and instruct it to re-skin the demo app. Record and document the result.

**Acceptance Criteria:**
- [ ] Test prompt: `"Fetch https://luongnv.com/sleek-ui/designs/editorial-dark.json and apply this design system to my demo-app/index.html"`
- [ ] Agent successfully fetches the JSON without errors
- [ ] "Recognizable fidelity" checklist passes:
  - [ ] Primary color (`hsl(245 90% 73%)` purple) visible in result
  - [ ] JetBrains Mono or Inter font-family applied
  - [ ] Border radius changed from square browser defaults
  - [ ] Dark mode CSS variables set on `.dark`
  - [ ] Overall aesthetic is recognizably "Editorial Dark"
- [ ] Before screenshot taken
- [ ] After screenshot taken
- [ ] Any agent quirks documented

**Dependencies:** Task 1.6, Task 1.7, Task 1.5

**PRD Reference:** §3.2 F07, §5.1 Success Criteria #1, §8.1 Milestone 1.13

---

### Task 1.9: Agent loop test — second agent (Cursor or Codex)

**Description:** Validate portability — the design URL must work with at least one other AI agent besides Claude Code. Document any differences in behavior.

**Acceptance Criteria:**
- [ ] Same test prompt used as Task 1.8 on Cursor or Codex
- [ ] "Recognizable fidelity" checklist passes (same as Task 1.8)
- [ ] Per-agent quirks documented (redirect handling, JSON fetch timeout, parsing differences)
- [ ] Results appended to `docs/cors-verification.md` or a new `docs/agent-test-results.md`

**Dependencies:** Task 1.8

**PRD Reference:** §3.2 F07, §8.1 Milestone 1.14

---

## Sprint 2 — MVP Foundation: All 3 Designs + Infrastructure

**Goal:** All three Phase 1 designs are live, validated, and fetchable. CI/CD hardened. Agent quirks documented.
**Duration:** ~4 days
**Exit criteria:** 3 designs pass schema validation and are accessible via stable URLs.

---

### Task 2.1: Author `warm-saas.json` design file

**Description:** Hand-craft the "Warm SaaS" design — amber tones, friendly, corporate, default light mode. Full token set for both light and dark.

**Acceptance Criteria:**
- [ ] File at `public/designs/warm-saas.json`
- [ ] Passes JSON schema validation
- [ ] Primary color in amber/orange HSL range (e.g., `38 92% 50%`)
- [ ] `defaultMode` = `"light"`
- [ ] `categories` = `["warm", "corporate"]`
- [ ] Both `tokens.colors.light` and `tokens.colors.dark` complete
- [ ] `fonts` field has a readable warm typography pairing (e.g., Plus Jakarta Sans + DM Mono or similar)
- [ ] `agentInstructions.steps` complete (7 steps)
- [ ] Preview paths referenced

**Dependencies:** Task 1.2 (schema), Task 1.4 (validation tooling)

**PRD Reference:** §3.2 F02, Phase 1 design table

---

### Task 2.2: Author `neo-brutalist.json` design file

**Description:** Hand-craft the "Neo Brutalist" design — bold, high contrast, playful, opinionated. Default light mode.

**Acceptance Criteria:**
- [ ] File at `public/designs/neo-brutalist.json`
- [ ] Passes JSON schema validation
- [ ] High-contrast primary (e.g., bold black on yellow, or vivid red/blue)
- [ ] `radius.default` = `"0"` or close to `0` (brutalist = no rounding)
- [ ] `defaultMode` = `"light"`
- [ ] `categories` = `["bold", "playful"]`
- [ ] Both `tokens.colors.light` and `tokens.colors.dark` complete
- [ ] Typography uses a display/grotesque font (e.g., Space Grotesk, Epilogue, or similar)
- [ ] `agentInstructions.steps` complete
- [ ] Preview paths referenced

**Dependencies:** Task 1.2, Task 1.4

**PRD Reference:** §3.2 F02, Phase 1 design table

---

### Task 2.3: Generate design preview thumbnails (3 designs)

**Description:** Create thumbnail and light/dark screenshot images for all 3 Phase 1 designs. These are used in the catalog grid cards and detail page.

**Acceptance Criteria:**
- [ ] For each design: `public/previews/{slug}-thumb.png`, `{slug}-light.png`, `{slug}-dark.png`
- [ ] Thumbnails: 400×300px minimum, shows representative color palette
- [ ] Screenshots: 1280×800px minimum, shows design applied to a representative UI
- [ ] Images are web-optimized (< 200KB each)
- [ ] Paths match the `preview` field values in each design JSON

**Dependencies:** Task 1.3, Task 2.1, Task 2.2

**PRD Reference:** §3.2 F02 acceptance criteria, §6.3 preview field

---

### Task 2.4: Validate all 3 designs end-to-end

**Description:** Run the full validation suite against all 3 designs. Fix any schema violations found.

**Acceptance Criteria:**
- [ ] `npm run validate:designs` passes with 0 errors for all 3 files
- [ ] Each design passes manual review: color roles visually distinct, fonts load from URLs, steps make sense
- [ ] WCAG AA contrast test passed manually for primary/background combinations in both modes
- [ ] All 3 designs accessible at their GitHub Pages URLs (200 OK)

**Dependencies:** Task 2.1, Task 2.2, Task 2.3, Task 1.7

**PRD Reference:** §5.4 Accessibility, §3.2 F02 acceptance criteria

---

### Task 2.5: Document per-agent quirks and README usage guide

**Description:** Write or update README with multi-agent usage instructions. Include findings from Tasks 1.8 and 1.9. This is what new users will read first.

**Acceptance Criteria:**
- [ ] README.md has a "Usage" section with instructions for: Claude Code, Cursor, Codex
- [ ] Includes the standard agent prompt template (from PRD Appendix §10.3)
- [ ] Documents any known agent quirks (redirect handling, fetch timeout, JSON size limits)
- [ ] Links to all 3 design JSON URLs
- [ ] Includes "Built with sleek-ui" badge markdown
- [ ] README renders correctly on GitHub

**Dependencies:** Task 1.9

**PRD Reference:** §3.2 F12, §8.2 Milestone 2.4

---

### Task 2.6: Harden CI/CD — add validation and CORS re-check step

**Description:** Update the GitHub Actions workflow to also run JSON schema validation and optionally verify CORS with a curl check. Prevents broken designs from shipping.

**Acceptance Criteria:**
- [ ] `deploy.yml` runs `npm run validate:designs` before build; fails workflow if validation errors
- [ ] CI/CD also runs `npm run build` and fails on build error
- [ ] (Optional) curl step checks `https://luongnv.com/sleek-ui/designs/editorial-dark.json` returns 200 after deploy
- [ ] Workflow badge added to README

**Dependencies:** Task 1.7, Task 1.4

**PRD Reference:** §6.5 Infra, §8.1 Milestone 1.11

---

### Task 2.7: Create `src/data/designs.js` design index

**Description:** Central index file that imports all design JSONs and exports them as a structured array. This is the data layer for the catalog website.

**Acceptance Criteria:**
- [ ] File at `src/data/designs.js`
- [ ] Imports all JSON files from `public/designs/`
- [ ] Exports array of design objects with: `slug`, `name`, `categories`, `colors.primary`, `colors.secondary`, `defaultMode`, `jsonUrl`, `thumbnailUrl`, `detailUrl`
- [ ] `jsonUrl` resolves to the GitHub Pages URL
- [ ] Adding a new design JSON + entry to this file is the only step needed to add it to the catalog

**Dependencies:** Task 2.4 (all designs valid)

**PRD Reference:** §6.2 Component Structure, `src/data/designs.js`

---

### Task 2.8: Design the catalog color system and global styles

**Description:** Set up the Tailwind configuration and global CSS for the catalog website itself — not the designs being displayed, but the site UI. Should feel premium and professional.

**Acceptance Criteria:**
- [ ] `tailwind.config.js` has a custom color palette for the catalog UI
- [ ] `src/index.css` sets up CSS custom properties for catalog UI
- [ ] Google Font loaded for catalog UI typography
- [ ] Dark mode support for the catalog website itself
- [ ] Light/dark toggle component available

**Dependencies:** Task 1.1

**PRD Reference:** §6.2, Web App design aesthetics

---

### Task 2.9: Build `CopyButton` and `SearchBar` utility components

**Description:** Reusable utility components needed across the catalog. Build and test these before assembling pages.

**Acceptance Criteria:**
- [ ] `CopyButton.jsx`: copies text to clipboard, shows "Copied!" feedback for 2s, reverts to original label
- [ ] `SearchBar.jsx`: controlled input, debounced (300ms), calls `onSearch(query)` callback
- [ ] Both components are accessible (keyboard navigable, ARIA labels)
- [ ] Both have unique IDs for interactive elements
- [ ] Storybook entry or simple isolation test renders correctly

**Dependencies:** Task 2.8

**PRD Reference:** §6.2 Component Structure

---

### Task 2.10: Build `CategoryFilter` component

**Description:** The category pill filter for the catalog home page. Allows filtering designs by category tags.

**Acceptance Criteria:**
- [ ] `CategoryFilter.jsx`: renders a pill for each category from a categories list prop
- [ ] Selected category is visually highlighted (filled, not just outlined)
- [ ] "All" pill is always first and deselects any active filter
- [ ] Supports multi-select or single-select (decide and document)
- [ ] `onFilter(selectedCategories)` callback fires on selection change
- [ ] Animates pill selection state change (subtle scale + color transition)

**Dependencies:** Task 2.8

**PRD Reference:** §3.2 F04 acceptance criteria, §5.4 Accessibility

---

## Sprint 3 — MVP Completion: Catalog Website Live

**Goal:** The browsable catalog is live on GitHub Pages with working home + detail pages and verified copy actions.
**Duration:** ~5 days
**Exit criteria:** Someone can browse, filter, search, and copy a design URL from the live catalog.

---

### Task 3.1: Build `DesignCard` component

**Description:** The grid card shown on the catalog home page for each design. Must display: thumbnail, name, categories pills, and color swatches.

**Acceptance Criteria:**
- [ ] `DesignCard.jsx` accepts a design object from `designs.js`
- [ ] Displays: thumbnail image, design name, category tag pills, 3 color swatches (primary, secondary, accent)
- [ ] Color swatches rendered from HSL token values
- [ ] Card is clickable — navigates to `/design/:slug`
- [ ] Hover effect: subtle lift (shadow or translate-y) with smooth transition
- [ ] Responsive: full-width on mobile, constrained on larger screens
- [ ] Loading state: skeleton placeholder while image loads

**Dependencies:** Task 2.7, Task 2.8

**PRD Reference:** §3.2 F04 acceptance criteria

---

### Task 3.2: Build `TokenTable` component

**Description:** Displays the full color token table on a design's detail page — all 17 semantic color roles with HSL values and visual color swatches.

**Acceptance Criteria:**
- [ ] `TokenTable.jsx` accepts a `colors` object (light or dark set)
- [ ] Renders a table row per token: role name, HSL value string, visual color swatch square
- [ ] Toggle between light and dark token sets via a prop or internal state
- [ ] Swatch squares are rendered using `hsl()` CSS color from the HSL string
- [ ] Table is scrollable on mobile without breaking layout
- [ ] Token names use `--kebab-case` CSS variable format display

**Dependencies:** Task 2.8

**PRD Reference:** §3.2 F05 acceptance criteria

---

### Task 3.3: Build `DesignDetail` component and Detail page

**Description:** The full design detail view — component previews, light/dark toggle, token table, and copy actions. The main value-delivery page of the catalog.

**Acceptance Criteria:**
- [ ] `DesignDetail.jsx` accepts a design slug, looks up design data from `designs.js`
- [ ] Light/dark mode preview toggle button — switches all preview components live
- [ ] Component previews with the design applied:
  - [ ] 3 button variants (primary, secondary, ghost)
  - [ ] Text input
  - [ ] Badge/tag component
  - [ ] Card with title + body text
- [ ] `TokenTable` embedded, toggled by light/dark switch
- [ ] 3 copy action buttons with `CopyButton`:
  - [ ] "Copy URL" → copies `https://luongnv.com/sleek-ui/designs/{slug}.json`
  - [ ] "View JSON" → opens JSON URL in new tab
  - [ ] "Copy Agent Prompt" → copies the full agent prompt template from PRD §10.3
- [ ] Back button → navigates to home
- [ ] Page `<title>` = `"{Design Name} — sleek-ui"`

**Dependencies:** Task 3.2, Task 2.9, Task 2.7

**PRD Reference:** §3.2 F05 acceptance criteria

---

### Task 3.4: Build Home page with grid, filter, and search

**Description:** The catalog home page — grid of DesignCards with category filtering and name search.

**Acceptance Criteria:**
- [ ] `Home.jsx` renders all designs as `DesignCard` grid
- [ ] Responsive grid: 1 col → 2 col → 3 col at responsive breakpoints
- [ ] `CategoryFilter` pills above grid — filters cards by category in real time
- [ ] `SearchBar` — filters by design name in real time (no page reload)
- [ ] "No results" empty state shown when filters match nothing
- [ ] Page `<title>` = `"sleek-ui — Design systems for AI agents"`
- [ ] Meta description set for SEO
- [ ] Page loads and renders in ≤ 2s on simulated 3G (Lighthouse check)

**Dependencies:** Task 3.1, Task 2.10, Task 2.9

**PRD Reference:** §3.2 F04 acceptance criteria

---

### Task 3.5: Set up React Router and App shell

**Description:** Wire up routing between Home and Detail pages. Configure hash router for GitHub Pages compatibility.

**Acceptance Criteria:**
- [ ] `App.jsx` uses `HashRouter` (for GitHub Pages `/* → index.html` limitation)
- [ ] Route `/` → `<Home />`
- [ ] Route `/design/:slug` → `<Detail />` (loads the correct design by slug)
- [ ] 404 route → redirects to `/`
- [ ] Navigation works with browser back/forward buttons
- [ ] Page scroll resets to top on route change

**Dependencies:** Task 3.1, Task 3.3, Task 3.4

**PRD Reference:** §6.2, §6.2 key decisions (Hash Router)

---

### Task 3.6: SEO and accessibility audit

**Description:** Ensure the catalog meets the non-functional requirements for accessibility and SEO before launch.

**Acceptance Criteria:**
- [ ] Lighthouse Accessibility score ≥ 90 on both Home and Detail pages
- [ ] Each page has a unique `<title>` tag
- [ ] Each page has a `<meta name="description">` tag
- [ ] Single `<h1>` per page with proper heading hierarchy
- [ ] All interactive elements (buttons, inputs, links) have unique IDs
- [ ] Color contrast of catalog UI elements passes WCAG AA
- [ ] `prefers-reduced-motion` media query disables catalog UI animations
- [ ] Keyboard navigation works for all interactive elements

**Dependencies:** Task 3.4, Task 3.3

**PRD Reference:** §5.2 Accessibility, §5.4 SEO best practices

---

### Task 3.7: End-to-end smoke test on staging (gh-pages)

**Description:** After deploying, manually test the entire user flow on the live GitHub Pages URL before announcing.

**Acceptance Criteria:**
- [ ] Home page loads at `https://luongnv.com/sleek-ui/`
- [ ] All 3 design cards visible with thumbnails
- [ ] Category filter works for each existing category tag
- [ ] Search filters cards by name
- [ ] Clicking a card navigates to correct detail page
- [ ] Light/dark toggle on detail page switches preview components
- [ ] "Copy URL" copies the correct JSON URL
- [ ] "Copy Agent Prompt" copies the full agent prompt
- [ ] "View JSON" opens the raw JSON in a new tab
- [ ] Browser back button returns to home
- [ ] All 3 JSON URLs are directly fetchable: `fetch(url).then(r => r.ok)` returns true

**Dependencies:** Task 3.5, Task 3.6, Task 1.7

**PRD Reference:** §3.2 F07, §8.1 Phase 1 exit criteria

---

### Task 3.8: Full agent loop re-test on live catalog

**Description:** After the catalog is live, re-run the agent loop using the real catalog URL to confirm the full workflow works as designed.

**Acceptance Criteria:**
- [ ] Vibe coder flow tested end-to-end: browse catalog → copy URL → paste into Claude Code → app re-skinned
- [ ] Tested for all 3 designs (editorial-dark, warm-saas, neo-brutalist)
- [ ] "Recognizable fidelity" checklist passes for each
- [ ] Results documented with screenshots (before/after)
- [ ] Any regressions from Sprint 1 loop test documented and fixed

**Dependencies:** Task 3.7

**PRD Reference:** §5.1 Success Criteria #1, #2

---

### Task 3.9: Write `docs/agent-test-results.md` and update README

**Description:** Consolidate all agent test findings into a single documentation file and update the README with the finalized usage instructions.

**Acceptance Criteria:**
- [ ] `docs/agent-test-results.md` created with:
  - Agent tested, design used, prompt used, result (pass/fail), screenshots, quirks
  - Covers Claude Code + 1 other agent × 3 designs
- [ ] README updated with link to agent test results
- [ ] README "Quick Start" section is finalized and accurate

**Dependencies:** Task 3.8

**PRD Reference:** §3.2 F12, §8.1 Milestone 1.15

---

### Task 3.10: Performance optimization

**Description:** Ensure the catalog meets performance NFRs — load time, image optimization, bundle size.

**Acceptance Criteria:**
- [ ] `npm run build` bundle size < 500KB gzipped
- [ ] All thumbnail images are WebP or optimized PNG < 200KB
- [ ] Lighthouse Performance score ≥ 80 on Home page
- [ ] Lazy loading applied to design thumbnails (offscreen images)
- [ ] No blocking render from Google Fonts (use `display=swap`)

**Dependencies:** Task 3.4, Task 3.5

**PRD Reference:** §5.1 Performance NFRs

---

### Task 3.11: Tag MVP release

**Description:** Create a GitHub release to mark the MVP milestone with the 3 live designs and working catalog.

**Acceptance Criteria:**
- [ ] `package.json` version bumped to `0.1.0`
- [ ] Git tag `v0.1.0` created and pushed
- [ ] GitHub Release created with:
  - Release notes listing 3 designs
  - Links to live catalog URL
  - Before/after screenshots from agent test
- [ ] Release links to `docs/agent-test-results.md`

**Dependencies:** Task 3.8, Task 3.9, Task 3.10

**PRD Reference:** §8.1 Phase 1 exit criteria, §5.1 Success Criteria

---

## Sprint 4 — Full Features: 5 Designs + Launch

**Goal:** Launch publicly with 5 designs, demo video, and social sharing.
**Duration:** ~4 days
**Exit criteria:** Demo video published and first social post sent.

---

### Task 4.1: Author `swiss-clean.json` design file

**Description:** Hand-craft the "Swiss Clean" design — precise, grid-based, neutral palette, inspired by Swiss International Typographic Style.

**Acceptance Criteria:**
- [ ] File at `public/designs/swiss-clean.json`
- [ ] Passes JSON schema validation
- [ ] Typography: Helvetica Neue / Inter at strict scale
- [ ] Color palette: near-monochromatic with one accent (red or primary signal color)
- [ ] `radius.default` = `"0"` or very small (Swiss style is geometric)
- [ ] `categories` includes `["minimal", "corporate"]`
- [ ] Both light and dark token sets complete
- [ ] Preview images created

**Dependencies:** Task 1.2, Task 2.3

**PRD Reference:** §3.2 F09, §8.2 Milestone 2.1

---

### Task 4.2: Author `deep-ocean.json` design file

**Description:** Hand-craft the "Deep Ocean" design — dark, cool blues and teals, immersive, high-quality.

**Acceptance Criteria:**
- [ ] File at `public/designs/deep-ocean.json`
- [ ] Passes JSON schema validation
- [ ] Background: deep navy/slate (e.g., `220 40% 8%`)
- [ ] Primary: bright teal or cyan (e.g., `185 80% 55%`)
- [ ] `defaultMode` = `"dark"`
- [ ] `categories` includes `["dark"]`
- [ ] Both light and dark token sets complete
- [ ] Preview images created

**Dependencies:** Task 1.2, Task 2.3

**PRD Reference:** §3.2 F09, §8.2 Milestone 2.2

---

### Task 4.3: Add Swiss Clean and Deep Ocean to catalog

**Description:** Update the design index and validate + deploy the 2 new designs to the live catalog.

**Acceptance Criteria:**
- [ ] `src/data/designs.js` includes both new designs
- [ ] `npm run validate:designs` passes for all 5 designs
- [ ] Both designs appear on catalog home page with thumbnails
- [ ] Detail pages work for both new designs
- [ ] All copy actions work for new designs
- [ ] CI/CD deploy succeeds with 5 designs

**Dependencies:** Task 4.1, Task 4.2, Task 2.7, Task 3.7

**PRD Reference:** §3.2 F09, §8.2 all milestones

---

### Task 4.4: Capture before/after screenshots for all 5 designs

**Description:** Document the transformation for each design — before (ugly demo app) and after (agent re-skinned result). These are the key marketing assets.

**Acceptance Criteria:**
- [ ] `docs/before-after/` folder with before + after screenshots for each of 5 designs
- [ ] Screenshots at 1280×800px
- [ ] "Before" is always the same ugly demo app (consistent baseline)
- [ ] "After" shows the re-skinned result with the design's distinctive style
- [ ] Images linked from README in a gallery section

**Dependencies:** Task 4.3, Task 3.8

**PRD Reference:** §3.2 F10, §8.2 Milestone 2.3, §5.1 Success Criteria #2

---

### Task 4.5: Evaluate `tailwindConfig` override field in schema

**Description:** Investigate and decide whether to add a `tailwindConfig` override field to `design.v1.json`. This field would let agents merge overrides directly into `tailwind.config.js`.

**Acceptance Criteria:**
- [ ] Research: what Tailwind config fields are most impactful to override (colors, fontFamily, borderRadius, spacing)
- [ ] Prototype: draft what the field would look like in editorial-dark.json
- [ ] Decision documented in `docs/schema-decisions.md`: add now, add in Phase 3, or reject
- [ ] If approved: update schema, update 3 existing designs, validate all
- [ ] If rejected: document reason (e.g., increases complexity without enough agent fidelity benefit)

**Dependencies:** Task 2.7, Task 1.2

**PRD Reference:** §9.1 OQ1, §3.2 F14 (Could)

---

### Task 4.6: Record demo video

**Description:** Record a screen capture of the complete "magic moment" — ugly demo app → agent command → transformed app. This is the primary shareable asset for launch.

**Acceptance Criteria:**
- [ ] Video shows: ugly demo app (clearly ugly) → typing the agent prompt with a design URL → agent running → transformed app
- [ ] Uses the editorial-dark.json or neo-brutalist.json (most visually dramatic)
- [ ] Video duration: 60–120 seconds
- [ ] No sound required (subtitles/captions preferred)
- [ ] Video exported as MP4 (for Twitter/X) and GIF (for GitHub README)
- [ ] GIF embedded in README
- [ ] Video uploaded to a sharable platform (YouTube, Loom, or similar)

**Dependencies:** Task 4.4, Task 3.8

**PRD Reference:** §3.2 F13, §8.2 Milestone 2.6, §5.1 Success Criteria #5

---

### Task 4.7: Social launch — post to Twitter/X, Reddit, Hacker News

**Description:** Publish the demo and catalog. Document all posts.

**Acceptance Criteria:**
- [ ] Twitter/X post written and published with demo video/GIF
- [ ] Reddit r/webdev post with before/after screenshots and catalog link
- [ ] Hacker News "Show HN" post: `"Show HN: sleek-ui — Re-skin your app with one AI agent command"`
- [ ] GitHub repo description updated: "The Unsplash of design systems for AI agents — re-skin your app with one URL"
- [ ] Links to all posts documented in `docs/launch-log.md`
- [ ] "Built with sleek-ui" badge format published in README

**Dependencies:** Task 4.6, Task 4.3

**PRD Reference:** §5.1 Success Criteria #5, §8.2 Milestone 2.8, Distribution Plan

---

### Task 4.8: Tag Phase 2 release and create GitHub Release notes

**Description:** Mark Phase 2 (full MVP launch) with a proper release.

**Acceptance Criteria:**
- [ ] `package.json` version bumped to `1.0.0`
- [ ] Git tag `v1.0.0` created and pushed
- [ ] GitHub Release `v1.0.0` created with:
  - Changelog: Phase 1 → Phase 2 delta
  - All 5 design names and URLs
  - Before/after gallery link
  - Demo video link
  - Agent usage quickstart
- [ ] Release pinned on GitHub repository

**Dependencies:** Task 4.7, Task 4.6

**PRD Reference:** §8.2 Phase 2 exit criteria

---

## Dependency Table

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1.1 | — | 1.7, 2.8 |
| 1.2 | — | 1.3, 1.4, 2.1, 2.2 |
| 1.3 | 1.2 | 1.4, 2.3, 2.4 |
| 1.4 | 1.2, 1.3 | 1.7, 2.6 |
| 1.5 | — | 1.8 |
| 1.6 | 1.7 | 1.8 |
| 1.7 | 1.1, 1.4 | 1.6, 3.7 |
| 1.8 | 1.5, 1.6, 1.7 | 1.9 |
| 1.9 | 1.8 | 2.5 |
| 2.1 | 1.2, 1.4 | 2.3, 2.4 |
| 2.2 | 1.2, 1.4 | 2.3, 2.4 |
| 2.3 | 1.3, 2.1, 2.2 | 2.4 |
| 2.4 | 2.1, 2.2, 2.3, 1.7 | 2.7 |
| 2.5 | 1.9 | 3.9 |
| 2.6 | 1.7, 1.4 | — |
| 2.7 | 2.4 | 3.1, 3.3, 3.4 |
| 2.8 | 1.1 | 3.1, 3.2, 3.3, 2.9, 2.10 |
| 2.9 | 2.8 | 3.3, 3.4 |
| 2.10 | 2.8 | 3.4 |
| 3.1 | 2.7, 2.8 | 3.4 |
| 3.2 | 2.8 | 3.3 |
| 3.3 | 3.2, 2.9, 2.7 | 3.5 |
| 3.4 | 3.1, 2.10, 2.9 | 3.5 |
| 3.5 | 3.3, 3.4 | 3.6, 3.7 |
| 3.6 | 3.4, 3.3 | 3.7 |
| 3.7 | 3.5, 3.6, 1.7 | 3.8 |
| 3.8 | 3.7 | 3.9, 3.11, 4.4 |
| 3.9 | 3.8, 2.5 | 3.11 |
| 3.10 | 3.4, 3.5 | 3.11 |
| 3.11 | 3.8, 3.9, 3.10 | — |
| 4.1 | 1.2, 2.3 | 4.3 |
| 4.2 | 1.2, 2.3 | 4.3 |
| 4.3 | 4.1, 4.2, 2.7, 3.7 | 4.4, 4.7 |
| 4.4 | 4.3, 3.8 | 4.6, 4.8 |
| 4.5 | 2.7, 1.2 | — |
| 4.6 | 4.4, 3.8 | 4.7, 4.8 |
| 4.7 | 4.6, 4.3 | 4.8 |
| 4.8 | 4.7, 4.6 | — |

---

## Execution Waves (parallelizable tasks per sprint)

### Sprint 1 Waves

| Wave | Tasks | Can run in parallel |
|------|-------|---------------------|
| Wave 1 | 1.1, 1.2, 1.5 | ✅ All independent |
| Wave 2 | 1.3, 1.4 | ✅ After 1.2; 1.3 and 1.4 depend on each other sequentially |
| Wave 3 | 1.7 | After 1.1, 1.4 |
| Wave 4 | 1.6 | After 1.7 |
| Wave 5 | 1.8 | After 1.5, 1.6, 1.7 |
| Wave 6 | 1.9 | After 1.8 |

### Sprint 2 Waves

| Wave | Tasks | Can run in parallel |
|------|-------|---------------------|
| Wave 1 | 2.1, 2.2, 2.8 | ✅ All independent of each other |
| Wave 2 | 2.3, 2.9, 2.10 | ✅ 2.3 after designs; 2.9+2.10 after 2.8 |
| Wave 3 | 2.4, 2.5, 2.6 | ✅ 2.4 after designs; 2.5 after 1.9; 2.6 after 1.7 |
| Wave 4 | 2.7 | After 2.4 |

### Sprint 3 Waves

| Wave | Tasks | Can run in parallel |
|------|-------|---------------------|
| Wave 1 | 3.1, 3.2, 3.10 | ✅ After their dependencies |
| Wave 2 | 3.3, 3.4 | ✅ 3.3 after 3.2; 3.4 after 3.1 |
| Wave 3 | 3.5 | After 3.3 + 3.4 |
| Wave 4 | 3.6 | After 3.5 |
| Wave 5 | 3.7 | After 3.5, 3.6 |
| Wave 6 | 3.8 | After 3.7 |
| Wave 7 | 3.9, 3.11 | 3.9 after 3.8; 3.11 after 3.8+3.9+3.10 |

### Sprint 4 Waves

| Wave | Tasks | Can run in parallel |
|------|-------|---------------------|
| Wave 1 | 4.1, 4.2, 4.5 | ✅ All independent of each other |
| Wave 2 | 4.3 | After 4.1 + 4.2 |
| Wave 3 | 4.4 | After 4.3 + 3.8 |
| Wave 4 | 4.6 | After 4.4 |
| Wave 5 | 4.7 | After 4.6 + 4.3 |
| Wave 6 | 4.8 | After 4.7 |

---

## Critical Path

**Longest dependency chain (minimum project duration):**

```
1.2 → 1.3 → 1.4 → 1.7 → 1.6 → 1.8 → 1.9 → 2.5
                                              ↓
                   2.4 → 2.7 → 3.3 → 3.5 → 3.7 → 3.8 → 3.9 → 3.11
                                                              ↓
                                                    4.3 → 4.4 → 4.6 → 4.7 → 4.8
```

**Bottleneck tasks** (blocking the most downstream work):
- **Task 1.2** (schema) — blocks all design authoring
- **Task 1.7** (CI/CD) — blocks CORS verification and agent tests
- **Task 2.7** (design index) — blocks all catalog page building
- **Task 3.7** (smoke test) — blocks launch path
- **Task 3.8** (full loop re-test) — blocks all 5-design and launch tasks

---

## Flagged Ambiguities

| # | Ambiguity | Location | Recommended Resolution |
|---|-----------|---------|------------------------|
| A1 | `CategoryFilter` single-select vs multi-select not decided | Task 2.10 | Default to single-select for MVP simplicity; ship multi-select in Phase 3 |
| A2 | `tailwindConfig` override field — add or defer? | Task 4.5 | Rejected (2026-03-29): Schema covers impact via tokens (colors, typography, radius, spacing, shadows); avoiding complexity. See `docs/schema-decisions.md` |
| A3 | Design versioning — do old URLs stay live when designs update? | PRD §9.1 OQ3 | Informational only for MVP; no versioned URLs |
| A4 | Preview thumbnails — generated or hand-crafted? | Task 2.3 | Hand-crafted for MVP; pipeline deferred to Phase 3 |
| A5 | Demo video format — with or without voiceover? | Task 4.6 | No voiceover; subtitles preferred for async sharing |
| A6 | Catalog analytics — add Plausible or ship without? | PRD §7.3 | Skip for MVP; add in post-launch iteration |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-26 | Luong NGUYEN | Initial tasks.md — 38 tasks across 4 sprints, from prd.md v1.0.0 |
