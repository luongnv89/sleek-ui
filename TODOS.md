# TODOS

## Phase 1 — During initial implementation

### Create CLAUDE.md
- **What:** Create a CLAUDE.md documenting project purpose, tech stack (Vite + React + Tailwind + shadcn), test commands (`npm test`), build commands (`npm run build`), deploy process, and a reference to the design.v1.json format.
- **Why:** Without it, every AI session re-discovers the stack from scratch. 30 seconds of setup saves minutes per session.
- **Blocked by:** Initial scaffold must exist first.

### JSON Schema validation in CI
- **What:** Add a CI step to the GitHub Actions deploy workflow that validates all `public/designs/*.json` files against `public/schema/design.v1.json` before deploying.
- **Why:** The design JSON format is the product. If a manual edit breaks a design file, agents get malformed data. Automated validation catches this before deploy.
- **Context:** Use `ajv-cli` or similar. A simple `npx ajv validate -s schema.json -d "designs/*.json"` step in the workflow.
- **Blocked by:** Schema file and at least one design JSON must exist.

## Phase 2 — After MVP is live

### Before/after screenshot automation
- **What:** Automate the generation of before/after screenshots for each design applied to the demo app. Use Playwright to: (1) screenshot the ugly demo app, (2) run an AI agent to apply a design, (3) screenshot the result.
- **Why:** As the catalog grows beyond 5 designs, manually generating screenshots becomes tedious. Automation ensures screenshots always match the actual agent output.
- **Context:** This supports the success criteria "before/after is compelling." For MVP, 3 screenshots are done manually.
- **Blocked by:** Phase 1 complete, demo app repo exists, at least one design proven to work.
