# Schema Guide — design.v1.json

Quick reference for the fields the extracted JSON must contain. Always validate against the authoritative schema at [`public/schema/design.v1.json`](../../../../public/schema/design.v1.json) before shipping.

## Top-Level Required Fields

```json
{
  "$schema": "https://luongnv.com/sleek-ui/schema/design.v1.json",
  "name": "my-design",
  "version": "1.0.0",
  "description": "At least 10 characters describing the aesthetic.",
  "categories": ["dark", "minimal"],
  "tokens": { ... },
  "fonts": { ... },
  "agentInstructions": { ... }
}
```

All seven top-level keys (`$schema`, `name`, `version`, `description`, `categories`, `tokens`, `fonts`, `agentInstructions`) are mandatory. The schema also accepts optional `author`, `collection`, `appTargets`, `accessibility`, `components`, `tokenColors`, `libraries`, and `preview`.

| Field | Rules |
|---|---|
| `$schema` | Must match the pattern `https://luongnv.com/sleek-ui/schema/design.v1.json` exactly |
| `name` | Unique slug — lowercase, alphanumeric, hyphens, dots OK (e.g., `linear.app`, `warm-saas`) |
| `version` | Semver, e.g., `1.0.0` |
| `description` | ≥ 10 characters |
| `categories` | Non-empty array of strings, e.g., `["dark", "minimal"]`, `["ai", "productivity"]` |

## HSL Color Format (shadcn convention)

Every color token in `tokens.colors.light` and `tokens.colors.dark` must match this regex:

```
^[0-9.]+ [0-9.]+% [0-9.]+%$
```

**Format**: `hue saturation% lightness%` — space-separated, no commas, no `hsl()` wrapper.

| Correct | Wrong |
|---|---|
| `"240 33% 14%"` | `"hsl(240, 33%, 14%)"` |
| `"245 90% 73%"` | `"240, 33%, 14%"` |
| `"0 0% 100%"` | `"#ffffff"` |
| `"240 10% 3.9%"` | `"240 10% 3.9"` (missing `%`) |

Decimal lightness and saturation are allowed (`3.9%`, `4.8%`). Hue is 0–360, saturation and lightness are 0–100.

## Required Color Tokens

Both `light` and `dark` must define **all** of these:

- `background`, `foreground`
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `muted`, `muted-foreground`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`
- `border`, `input`, `ring`
- `card`, `card-foreground`

Additional tokens like `success`, `warning`, `info` are allowed but not required.

## Required Token Sections

`tokens` must include these five keys:

1. **`colors`** — with `light` + `dark` sub-objects (above)
2. **`typography`** — `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
3. **`spacing`** — must include `unit` (e.g., `"4px"`); scale keys (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) are optional but recommended
4. **`radius`** — `sm`, `default`, `lg`, `full` all required
5. **`shadows`** — `sm`, `default`, `lg` (all optional individually but include the object)

A sixth key, **`motion`**, is optional — see [Motion Tokens](#motion-tokens-optional) below.

## Typography Defaults

When the source doesn't clearly specify, use these defaults:

```json
"fontSize": {
  "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem",
  "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem"
},
"fontWeight": { "normal": 400, "medium": 500, "semibold": 600, "bold": 700 },
"lineHeight": { "tight": "1.25", "normal": "1.5", "relaxed": "1.625" },
"letterSpacing": { "tight": "-0.025em", "normal": "0", "wide": "0.025em" }
```

## Radius Defaults

| Style | sm | default | lg | full |
|---|---|---|---|---|
| Sharp (neo-brutalist) | `0` | `0` | `0` | `9999px` |
| Standard | `0.125rem` | `0.375rem` | `0.5rem` | `9999px` |
| Rounded (modern SaaS) | `0.25rem` | `0.5rem` | `0.75rem` | `9999px` |
| Very rounded (Apple-like) | `0.5rem` | `0.75rem` | `1rem` | `9999px` |

## Shadow Defaults

```json
"shadows": {
  "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "default": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
}
```

For flat / neo-brutalist designs, replace with hard offset shadows (e.g., `"4px 4px 0 0 rgb(0 0 0)"`).

## Motion Tokens (optional)

`tokens.motion` captures animation behavior. **Omit it entirely** when the source has no meaningful motion or the input is a screenshot — never fabricate values.

```json
"motion": {
  "duration": { "fast": "150ms", "normal": "300ms", "slow": { "value": 0.5, "unit": "s" } },
  "delay": { "stagger": "75ms" },
  "easing": { "standard": [0.4, 0, 0.2, 1], "bounce": "ease-out" },
  "iteration": { "once": 1, "loop": "infinite" },
  "keyframes": {
    "fade-in": { "0%": { "opacity": "0" }, "100%": { "opacity": "1" } },
    "slide-up": { "from": { "transform": "translateY(8px)" }, "to": { "transform": "translateY(0)" } }
  },
  "effects": [
    { "name": "hover-lift", "trigger": "hover", "target": "button", "properties": ["transform"], "duration": "fast", "easing": "bounce" },
    { "name": "card-fade-in", "trigger": "entrance", "target": "card", "keyframes": "fade-in", "duration": "normal" },
    { "name": "scroll-reveal", "trigger": "scroll", "target": "section", "description": "fade in on scroll" }
  ]
}
```

| Field | Shape | Rules |
|---|---|---|
| `duration` / `delay` | `{name: "150ms"}` or `{name: {value, unit}}` | Strings must end in `ms`/`s`; `unit` is `"ms"` or `"s"` |
| `easing` | `{name: "ease-out"}` or `{name: [0.4, 0, 0.2, 1]}` | Cubic-bezier easings are **4-number arrays** (W3C DTCG cubicBezier), never `"cubic-bezier(...)"` strings — the runtime token sanitizer rejects parentheses. CSS keywords and library easing names (`"power2.out"`) stay strings. |
| `iteration` | `{name: 1}` or `{name: "infinite"}` | Numbers or strings |
| `keyframes` | `{name: {offset: {prop: value}}}` | Offsets like `"0%"`, `"50%"`, `"from"`, `"to"`; property values are strings or numbers |
| `effects` | array | Each entry requires `name` + `trigger` (`hover`, `focus`, `active`, `entrance`, `exit`, `scroll`, `load`, `custom`); `target`, `properties`, `duration`, `delay`, `easing`, `iteration`, `keyframes`, `description` optional. `duration`/`delay`/`easing`/`keyframes` may reference named entries above. |

## Libraries (optional)

Top-level `libraries` lists external packages needed to reproduce the design — typically animation libraries detected during URL extraction. **Omit it** when none were detected.

```json
"libraries": [
  {
    "name": "GSAP",
    "package": "gsap",
    "version": "^3.12.5",
    "purpose": "scroll-driven entrance animations"
  }
]
```

`name`, `package`, and `purpose` are required per entry; `version` is optional. `package` must be an npm package name and `version`, when present, must be a semver constraint. Do not store free-form installation commands; generated prompts derive package-manager guidance from these validated fields.

## Fonts Section

```json
"fonts": {
  "google": [
    { "family": "Inter", "weights": [400, 500, 600, 700] },
    { "family": "JetBrains Mono", "weights": [400, 500] }
  ],
  "urls": [
    {
      "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      "format": "css2",
      "family": "Inter"
    }
  ]
}
```

`fonts.urls` is required; `fonts.google` is optional but recommended for tooling. URLs must use the `css2` API with explicit `wght@` tuples.

## Accessibility Defaults

```json
"accessibility": {
  "contrastTarget": 4.5,
  "focusRing": { "width": "2px", "color": "currentColor", "offset": "2px" },
  "reducedMotion": true
}
```

Use `contrastTarget: 7.0` only for designs explicitly aimed at AAA compliance.

## Standard Agent Instructions

Use this block verbatim unless the design needs special handling:

```json
"agentInstructions": {
  "defaultMode": "light",
  "steps": [
    "Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)",
    "Set --radius from tokens.radius.default",
    "Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag",
    "Set font-family from tokens.typography.fontFamily",
    "Apply component styles from the components field (Tailwind class names for shadcn projects)",
    "Reproduce animations when tokens.motion is present — map CSS-compatible easings to --ease-* theme keys, apply library-native easings through the relevant library API, and map keyframes to @keyframes + --animate-* (Tailwind v4); add packages listed in libraries",
    "Ensure focus states match accessibility.focusRing specification",
    "Test both light and dark modes"
  ]
}
```

`defaultMode` must be `"light"` or `"dark"` — pick whichever matches the source's primary mode.

## Components Section (Recommended)

```json
"components": {
  "button": {
    "primary": {
      "background": "primary", "color": "primary-foreground",
      "borderRadius": "radius.default", "padding": "spacing.sm spacing.md",
      "fontWeight": "semibold"
    },
    "secondary": { "background": "secondary", "color": "secondary-foreground", ... },
    "ghost": { "background": "transparent", "color": "foreground", ... }
  },
  "card": {
    "background": "card", "color": "card-foreground",
    "borderRadius": "radius.lg", "padding": "spacing.lg",
    "shadow": "shadows.default", "border": "1px solid border"
  },
  "input": {
    "background": "background", "color": "foreground",
    "borderRadius": "radius.default", "padding": "spacing.sm spacing.md",
    "border": "1px solid input", "focusRing": "focusRing",
    "placeholderColor": "muted-foreground"
  }
}
```

Reference token names (e.g., `"primary"`, `"radius.default"`) rather than raw values — the agent resolves them at apply time.

## Preview Section (sleek-ui only)

When adding to the sleek-ui catalog, include:

```json
"preview": {
  "thumbnail": "/previews/{slug}-thumb.svg",
  "screenshots": {
    "light": ["/previews/{slug}-light.svg"],
    "dark": ["/previews/{slug}-dark.svg"]
  }
}
```

Only `thumbnail` is strictly needed for the landing page grid — light/dark screenshots are optional.

## Validation

After writing the JSON inside the sleek-ui repo:

```bash
npm run validate:designs
```

This compiles the schema with AJV and reports per-file errors. If any design fails, the script exits 1 — fix and re-run.
