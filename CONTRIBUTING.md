# Contributing to sleek-ui

Thank you for your interest in contributing! sleek-ui is an open catalog of design systems for AI agents — contributions of new designs, bug fixes, and improvements are all welcome.

## Ways to Contribute

- **Add a new design** — model a brand's visual language as a `design.v1.json` file
- **Improve existing designs** — fix color values, typography, or token accuracy
- **Improve the catalog app** — UI fixes, features, accessibility improvements
- **Improve documentation** — clearer examples, better agent instructions
- **Report bugs** — open an issue with a clear reproduction

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Local dev

```bash
git clone https://github.com/luongnv89/sleek-ui.git
cd sleek-ui
npm install
npm run dev
```

Open http://localhost:5173 to see the catalog.

### Validate designs

```bash
npm run validate:designs
```

All design JSON files must pass schema validation before submitting.

### Build

```bash
npm run build
```

## Branching Strategy

- Branch from `main`
- Use Conventional Commits prefixes for branch names:
  - `feat/` — new design or feature
  - `fix/` — bug fix
  - `docs/` — documentation only
  - `chore/` — maintenance

Example: `feat/add-notion-design`, `fix/editorial-dark-radius`

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add notion design system
fix: correct primary color token in editorial-dark
docs: update agent prompt template in README
chore: update schema validation script
```

## Adding a New Design

1. Create `public/designs/{slug}.json` following the `design.v1.json` schema
2. Create the matching `src/data/designs/{slug}.json` (same file, both locations)
3. Run `npm run validate:designs` — must pass
4. Add a thumbnail to `public/previews/{slug}.png` (optional but recommended)
5. The design will appear automatically in the catalog

### Design file checklist

- [ ] `$schema` points to `https://luongnv.com/sleek-ui/schema/design.v1.json`
- [ ] `name` matches the filename (without `.json`)
- [ ] Both `tokens.colors.light` and `tokens.colors.dark` are complete
- [ ] Colors use HSL without `hsl()` wrapper (shadcn convention: `"240 33% 14%"`)
- [ ] `fonts.urls` or `fonts.google` is populated
- [ ] `agentInstructions.steps` has numbered, actionable steps
- [ ] `categories` is an array of at least one category

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Run `npm run validate:designs` and `npm run build` — both must pass
3. Open a PR with a clear description of what changed and why
4. A maintainer will review within a few days

## Coding Standards

- TypeScript for all source files in `src/`
- Tailwind CSS utility classes (no custom CSS unless unavoidable)
- Components in `src/components/`, pages/routes in `src/App.tsx`
- Keep components focused — one responsibility per file

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
