# sleek-ui

[![Deploy](https://github.com/luongnv89/sleek-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/luongnv89/sleek-ui/actions/workflows/deploy.yml)

Design system for AI agent-driven UI customization.

> The "Unsplash of Design Systems for AI Agents" — paste a URL, get a professional design.

## Quick Start

```bash
# Pick a design URL, then tell your AI agent:
"Fetch https://luongnv89.github.io/sleek-ui/designs/editorial-dark.json 
and apply this design to my project"
```

## Designs

| Design | Vibe | Default Mode | URL |
|--------|------|--------------|-----|
| Editorial Dark | Sophisticated, muted purples | dark | [JSON](https://luongnv89.github.io/sleek-ui/designs/editorial-dark.json) |
| Warm SaaS | Friendly, amber tones | light | [JSON](https://luongnv89.github.io/sleek-ui/designs/warm-saas.json) |
| Neo Brutalist | Bold, high contrast | light | [JSON](https://luongnv89.github.io/sleek-ui/designs/neo-brutalist.json) |

## Usage

### Claude Code

1. Run Claude Code: `claude`
2. Paste the design URL and prompt:

```
Fetch https://luongnv89.github.io/sleek-ui/designs/{slug}.json and apply this design system to my project.
```

3. Claude will:
   - Fetch the JSON from GitHub Pages
   - Read `agentInstructions.steps` for application instructions
   - Set CSS custom properties for colors (`:root` for light, `.dark` for dark mode)
   - Add Google Fonts via `<link>` tag
   - Apply component styles from the `components` field

### Cursor

1. Open your project in Cursor
2. Use Cmd+K (or Ctrl+K) to open the composer
3. Paste the design URL and prompt:

```
Fetch https://luongnv89.github.io/sleek-ui/designs/{slug}.json and apply this design system to my project.
```

4. Cursor will modify your CSS files to apply the design tokens

### Codex CLI

1. Run Codex: `codex` or `codex cli`
2. Enter the design URL and prompt:

```
Fetch https://luongnv89.github.io/sleek-ui/designs/{slug}.json and apply this design system to my project.
```

## Standard Agent Prompt Template

```
Fetch the design system at: https://luongnv89.github.io/sleek-ui/designs/{slug}.json

Read the JSON, then follow the steps in agentInstructions.steps to apply this design system to my project:
1. Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)
2. Set --radius from tokens.radius.default
3. Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag
4. Set font-family from tokens.typography.fontFamily
5. Apply component styles from the components field (Tailwind class names for shadcn projects)
6. Ensure focus states match accessibility.focusRing specification
7. Test both light and dark modes

Target framework: Tailwind CSS + shadcn/ui. For other frameworks, map token names to CSS custom properties semantically.
```

## Known Agent Quirks

### Redirect Handling

- **GitHub Pages URL**: `https://luongnv89.github.io/sleek-ui/designs/*.json`
- **Note**: Some agents may encounter redirects. The URL should work directly, but if you see issues, ensure your agent is following HTTP 301/302 redirects automatically.

### Fetch Timeout

- Default HTTP client timeouts may vary by agent
- Design JSON files are <20KB each, well within typical timeout limits
- If you encounter timeouts, increase the timeout to 30 seconds

### JSON Size Limits

- All design files are optimized to <20KB
- No known JSON parsing issues with any major agent
- HSL color format: `240 33% 14%` (no `hsl()` wrapper, shadcn convention)

### Font Loading

- Some agents may not automatically add `<link>` tags for Google Fonts
- If fonts don't load, manually add the font URL from `fonts.urls` to your HTML `<head>`
- Example: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`

### Dark Mode Implementation

- The design JSON uses `.dark` class for dark mode tokens
- Ensure your app toggles a `.dark` class on the `<html>` or `<body>` element
- CSS variables should be set on both `:root` (light defaults) and `.dark` (overrides)

## Project Structure

```
├── public/designs/     # Design JSON files (served by GitHub Pages)
├── public/previews/    # Preview images
├── public/schema/      # JSON Schema for design files
├── docs/               # Documentation
│   ├── agent-loop-test-11.md  # Claude Code test results
│   ├── agent-loop-test-12.md  # Codex test results
│   └── cors-verification.md   # CORS configuration
└── .github/workflows/  # CI/CD workflows
```

## Deployment

- **GitHub Pages**: https://luongnv89.github.io/sleek-ui/
- **Custom domain**: https://sleek-ui.design

## CORS Verification

See [docs/cors-verification.md](docs/cors-verification.md) for CORS configuration and testing.

---

## Built with sleek-ui

If you use sleek-ui in your project, add this badge to your README:

```markdown
[![Built with sleek-ui](https://img.shields.io/badge/Built%20with-sleek--ui-blue?style=flat-square)](https://github.com/luongnv89/sleek-ui)
```

---

## License

MIT
