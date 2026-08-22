# AGENTS.md

Instructions for AI coding agents working in this repository.

sleek-ui is the "Unsplash of Design Systems for AI Agents" — a catalog of pre-designed, accessible UI design systems (JSON files) that agents apply to any web project.

## Critical Commands

Full environment notes: [docs/AGENT_ENV.md](docs/AGENT_ENV.md)

```bash
npm ci                    # Install exact dependencies
npm run dev               # Vite dev server
npm run build             # Production build → dist/
npm test                  # Run Jest 30 unit tests
npm run validate:designs  # Validate public/designs/*.json against schema
```

## Architecture Map

```
├── public/designs/     # 60 design JSON files, served by GitHub Pages
├── public/previews/    # Preview images
├── public/schema/      # JSON Schema for design files (design.v1.json)
├── scripts/            # validate-designs.js, ingest-designs.js
├── src/data/designs/   # Mirrored catalog used by the React app
├── video/              # Separate Remotion package (own npm install)
└── docs/AGENT_ENV.md   # Agent environment notes — commands of record
```

## Hard Rules

- IMPORTANT: `video/` has its own `package.json` — root `npm ci` does not install it.
- IMPORTANT: Build output goes to `dist/` (deployed via GitHub Actions), not `public/`.
- Never remove `base: '/sleek-ui/'` from `vite.config.js` — Pages deployment depends on it.
- Never commit `node_modules/` from either package.
- Keep `npm run validate:designs` green — CI runs it before every deploy.

## Workflow Preferences

- Make minimal changes; do not reformat untouched code.
- Run `npm test` after changing `src/`; run `npm run validate:designs` after touching any file in `public/designs/` or `public/schema/`.

## Agent Prompt Template

To apply a design system to another project:

```
Fetch https://luongnv.com/sleek-ui/designs/{slug}.json
and apply this design system to my project.
```

See [README.md](README.md) for detailed agent-specific instructions (Claude Code, Cursor, Codex CLI).

## Token Efficiency

- Never re-read files you just wrote or edited. You know the contents.
- Never re-run commands to "verify" unless the outcome was uncertain.
- Don't echo back large blocks of code or file contents unless asked.
- Batch related edits into single operations. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." Just do it.
- If a task needs 1 tool call, don't use 3. Plan before acting.
- Do not summarize what you just did unless the result is ambiguous or you need additional input.
