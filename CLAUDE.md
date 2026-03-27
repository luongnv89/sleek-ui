# sleek-ui

Design system for AI agent-driven UI customization.

> The "Unsplash of Design Systems for AI Agents" — paste a URL, get a professional design.

## Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.21
- **Styling**: Tailwind CSS 3.4.19 + shadcn/ui
- **Design Format**: Custom JSON schema (design.v1.json)

## Project Purpose

sleek-ui provides a catalog of pre-designed, accessible UI design systems that can be applied to any web project via AI agents. Each design is stored as a JSON file with complete CSS custom properties, typography, spacing, and component specifications.

## Development Commands

### Local Development

```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
```

### Testing

```bash
npm test        # Run tests (currently: echo "Error: no test specified")
```

### Validation

```bash
npm run validate:designs  # Validate design JSON files against schema
```

## Deploy Process

- **GitHub Pages**: https://luongnv89.github.io/sleek-ui/
- **Custom domain**: https://sleek-ui.design
- **CI/CD**: GitHub Actions workflow in `.github/workflows/deploy.yml`
- **Build output**: Served from `public/` directory

## Design Files

Designs are stored in `public/designs/` and follow the `design.v1.json` schema:

| Design | URL |
|--------|-----|
| Editorial Dark | [editorial-dark.json](public/designs/editorial-dark.json) |
| Warm SaaS | [warm-saas.json](public/designs/warm-saas.json) |
| Neo Brutalist | [neo-brutalist.json](public/designs/neo-brutalist.json) |

## Design Schema

See [public/schema/design.v1.json](public/schema/design.v1.json) for the complete JSON schema.

### Key Properties

- `tokens.colors.light/dark` - HSL color tokens (shadcn format: "240 33% 14%")
- `tokens.typography.fontFamily` - Font stack definitions
- `tokens.radius.*` - Border radius values
- `fonts.urls` - Google Fonts CSS links
- `agentInstructions.steps` - AI agent application instructions
- `accessibility.focusRing` - Focus state specifications

## Agent Prompt Template

To apply a design system, tell your AI agent:

```
Fetch https://luongnv89.github.io/sleek-ui/designs/{slug}.json
and apply this design system to my project.
```

See [README.md](README.md) for detailed agent-specific instructions (Claude Code, Cursor, Codex CLI).

## Project Structure

```
├── public/designs/     # Design JSON files (served by GitHub Pages)
├── public/previews/    # Preview images
├── public/schema/      # JSON Schema for design files
├── docs/               # Documentation
├── .github/workflows/  # CI/CD workflows
├── CLAUDE.md          # This file
├── README.md          # User-facing documentation
├── PRD.md             # Product requirements
├── RELEASE.md         # Release notes
└── package.json       # Dependencies and scripts
```

## References

- [GitHub Repository](https://github.com/luongnv89/sleek-ui)
- [Design Schema](public/schema/design.v1.json)
- [Design Systems Directory](https://luongnv89.github.io/sleek-ui/designs/)
