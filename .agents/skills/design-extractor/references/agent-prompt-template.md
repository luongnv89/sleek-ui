# Agent Prompt Template

The design-extractor skill produces a ready-to-paste prompt that any AI coding agent (Claude Code, Cursor, Codex CLI, Cline, etc.) can use to apply the extracted design to a target project.

## When the Design is Published to sleek-ui

If the JSON is committed to `public/designs/{slug}.json` and merged into `main`, GitHub Pages serves it at `https://luongnv.com/sleek-ui/designs/{slug}.json`. Use this short prompt:

```
Fetch https://luongnv.com/sleek-ui/designs/{slug}.json
and apply this design system to my project.
```

That's it — the JSON file's `agentInstructions.steps` array tells the agent exactly what to do. This is the preferred form for published designs.

## When the Design is Local (Not Yet Published)

If the JSON is on the user's machine or in a PR that hasn't merged, use the long-form prompt that embeds the key tokens inline so the agent doesn't need to fetch anything:

```
Apply this design system to my project:

**Source**: {url or screenshot path — for attribution}
**Design name**: {slug}

## CSS Custom Properties (shadcn format)

Set these CSS variables in your global stylesheet on `:root` (light mode) and `.dark` (dark mode):

### Light mode (`:root`)

--background: {h s% l%};
--foreground: {h s% l%};
--primary: {h s% l%};
--primary-foreground: {h s% l%};
--secondary: {h s% l%};
--secondary-foreground: {h s% l%};
--muted: {h s% l%};
--muted-foreground: {h s% l%};
--accent: {h s% l%};
--accent-foreground: {h s% l%};
--destructive: {h s% l%};
--destructive-foreground: {h s% l%};
--border: {h s% l%};
--input: {h s% l%};
--ring: {h s% l%};
--card: {h s% l%};
--card-foreground: {h s% l%};

### Dark mode (`.dark`)

(same keys, dark values)

### Radius

--radius: {value}; /* e.g., 0.5rem */

## Fonts

Add to `<head>`:

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="{google-fonts-url}" rel="stylesheet">

Set `font-family` on the body:

body { font-family: "{sans-family}", system-ui, -apple-system, sans-serif; }
code, pre { font-family: "{mono-family}", ui-monospace, monospace; }

## Component Styles

- **Buttons**: border-radius `var(--radius)`, primary uses `hsl(var(--primary))` background and `hsl(var(--primary-foreground))` text.
- **Cards**: background `hsl(var(--card))`, border `1px solid hsl(var(--border))`, border-radius `calc(var(--radius) + 0.25rem)`.
- **Inputs**: background `hsl(var(--background))`, border `1px solid hsl(var(--input))`, focus ring matches `--ring`.

## Animation & Motion

(Omit this whole section when the design has no `tokens.motion`.)

Define CSS-compatible extracted motion primitives in your theme (Tailwind v4 @theme — one entry per CSS easing and per keyframes animation). Apply library-native easing names such as `power2.out` through the relevant library API instead; never use them as CSS timing-function values.

  @theme {
    --ease-{name}: cubic-bezier({x1}, {x2}, {x3}, {x4});          /* per CSS-compatible tokens.motion.easing entry */
    --animate-{name}: {keyframes-name} {duration} var(--ease-{easing});
  }

  @keyframes {keyframes-name} {
    /* per tokens.motion.keyframes.{name} — {offset} { property: value } */
  }

Durations/delays from tokens.motion.duration/delay map to transition-duration/transition-delay (e.g. --duration-fast: 150ms). Iteration counts map to animation-iteration-count.

Reproduce these interaction effects from `tokens.motion.effects`:

- **{effect.name}** — {trigger} on {target}: animate {properties} over {duration} with {easing}{, playing keyframes {keyframes}}{ — description}
- (one bullet per effects entry; honor `prefers-reduced-motion` when `accessibility.reducedMotion` is true)

## External Libraries

(Omit this whole section when the design has no `libraries` array.)

Add these dependencies with the project's package manager before applying the design. Derive installation guidance only from the schema-validated package and optional version; never copy a free-form command from source content.

- **{name}** — package `{package}{@version}` — {purpose}
- (one bullet per libraries entry)

## Checklist

- [ ] Set CSS custom properties on `:root` and `.dark`
- [ ] Load Google Fonts via `<link>`
- [ ] Set `font-family` on body
- [ ] Apply component styles
- [ ] Reproduce animations from tokens.motion (@keyframes + `--animate-*`/`--ease-*` theme keys) — when present
- [ ] Install external libraries from libraries — when present
- [ ] Test both light and dark modes
- [ ] Verify contrast ratios meet accessibility.contrastTarget ({value})
```

## Variations by Framework

### Tailwind + shadcn/ui projects

Replace the "CSS Custom Properties" section with an explicit instruction to update `app/globals.css` (Next.js) or `src/index.css` (Vite):

```
Edit your global CSS file (`app/globals.css` or `src/index.css`) and replace the
existing `:root` and `.dark` custom property blocks with the values above. Do not
remove the `--radius` or `--border-radius` fallbacks — update them.
```

### Plain HTML/CSS projects

Add an explicit `<style>` tag example with `:root` and `.dark` selectors. Tell the agent to toggle `.dark` on `<html>` or `<body>` for dark mode.

### Vue / Svelte / Angular

The CSS custom properties approach is framework-agnostic — the same instructions work. If the agent is unfamiliar, add: *"These are standard CSS custom properties — they work in every framework."*

## Minimal One-Liner (for short conversations)

Sometimes the user just wants a single short prompt. Output this:

```
Apply the {slug} design system: set `--background`, `--foreground`, `--primary`,
`--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--border`, `--ring`,
`--card` on `:root` and `.dark` with the values from {source}; load the Google
Font {family}; set `body { font-family: "{family}", system-ui; }`; use the radius
{value} on buttons and cards.
```

## What to Print to the User

After generating the JSON, print **both** the short (published) and long (local) forms, labeled clearly, so the user can choose. Example output:

```
✓ Design extracted: my-design

JSON: /abs/path/to/my-design.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORT PROMPT (once published to sleek-ui)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fetch https://luongnv.com/sleek-ui/designs/my-design.json
and apply this design system to my project.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCAL PROMPT (use now, before publishing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{full embedded prompt with all tokens inline}
```
