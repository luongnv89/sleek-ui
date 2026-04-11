# Extraction Guide

How to turn a screenshot or a URL into a set of design tokens.

## URL Input — Browse & Capture

For URL inputs, use the `/browse` skill from gstack. Never invoke `mcp__claude-in-chrome__*` tools or `WebFetch` for design extraction — they return HTML, not a rendered screenshot.

**Browse workflow:**

1. Navigate to the URL via `/browse`.
2. Capture a full-page screenshot (or at minimum the above-the-fold hero + a second shot of a CTA section).
3. Save the screenshot to a temp path — e.g., `/tmp/extract-{slug}.png`.
4. `Read` the screenshot file — the vision-capable model analyzes it directly.

If the site has both light and dark modes, capture both (toggle theme or append `?theme=dark` if supported). This gives you accurate token values for both modes instead of deriving one from the other.

If `/browse` is unavailable, ask the user to paste a screenshot instead.

## Screenshot Input — Direct Read

When the user provides a local screenshot path:

1. Verify the file exists.
2. `Read` the image — the model sees it as visual context.
3. Proceed to analysis.

Supported formats: PNG, JPG/JPEG, WEBP. If the user provides an unsupported format, ask them to convert.

## Visual Analysis — What to Look At

Read the image and identify these concrete visual anchors:

### Colors

- **Background**: the dominant page color — typically white (`0 0% 100%`), off-white, or a dark neutral (`240 10% 4%`).
- **Foreground**: primary text color on the background.
- **Primary**: the most prominent CTA / brand color — usually in buttons, links, active navigation, and the hero.
- **Secondary**: supporting color — often a muted version of primary or a neutral gray.
- **Muted**: placeholder text, secondary copy, disabled states.
- **Accent**: hover states, subtle highlights, chip backgrounds.
- **Destructive**: error / delete / warning red (usually `0 84% 60%` in light, `0 63% 31%` in dark).
- **Border**: divider lines between cards and sections.
- **Card**: card / modal / panel background (slightly different from page background in dark mode).
- **Ring**: focus outline color — usually matches primary.

For each token, pick a **single representative pixel** (not an average) and convert to HSL:

1. Sample the hex color from the screenshot.
2. Convert hex → HSL using the standard formula (or ask the model to do this mentally — Claude is good at hex/HSL conversion).
3. Format as `"H S% L%"` — space-separated, no wrapper.

**Foreground-on-background pairs** — always set `primary-foreground` to maintain contrast with `primary`. If `primary` is a medium-bright color, foreground is usually white (`0 0% 100%`). If `primary` is pale, foreground is usually near-black.

### Typography

- **Heading font family** — look at hero headlines, section titles.
- **Body font family** — look at paragraphs, labels.
- **Monospace** — look at code blocks, terminals. If none visible, default to `"JetBrains Mono"` or `"Fira Code"`.
- **Font size scale** — observe the relative size between headings and body. Modern sites usually use a 1.25 (major third) or 1.333 (perfect fourth) ratio.
- **Font weight** — observe the boldness of headings vs body. Most modern sites use 600 or 700 for headings, 400 or 500 for body.
- **Line height** — tight for headlines (~1.1–1.25), relaxed for body (~1.5–1.75).
- **Letter spacing** — tight on large headings (`-0.025em`), normal on body.

If you can't identify the exact font name, pick the closest Google Fonts equivalent:

| If the source uses… | Use Google Fonts equivalent |
|---|---|
| SF Pro, Helvetica Neue, system sans | `Inter` |
| Söhne, Graphik, Circular | `Inter` or `Manrope` |
| Roboto, Droid Sans | `Roboto` |
| Georgia, Charter, serifs for body | `Lora` or `Source Serif 4` |
| Display serifs (big editorial) | `Playfair Display`, `Cormorant` |
| Geometric sans (Futura, Avenir) | `DM Sans`, `Space Grotesk` |
| Mono (SF Mono, JetBrains Mono) | `JetBrains Mono`, `Fira Code` |

Note the substitution in the design `description` field so users know they're getting the closest-match font.

### Spacing

Most modern sites use a 4px base unit. Observe padding on buttons, cards, and sections:

- If buttons have ~12px horizontal padding: unit = 4px, scale = standard.
- If sections have very tight spacing (~8–16px): compact design.
- If sections have generous spacing (~48–96px): spacious design.

Default to `unit: "4px"` unless the source is obviously different.

### Border Radius

Read button and card corners:

- **Sharp corners** (0px) → neo-brutalist
- **Slightly rounded** (2–4px) → minimal / enterprise
- **Moderately rounded** (6–8px) → standard modern SaaS (shadcn default)
- **Very rounded** (12–16px) → friendly / approachable
- **Pill-shaped** (full) → use `full: "9999px"`

### Shadows

- **Flat** (no shadow, just borders) → neo-brutalist, swiss-style
- **Subtle** (1–2px offset, low alpha) → modern SaaS default
- **Prominent** (larger offset, higher alpha) → playful / marketing-heavy
- **Hard** (offset with no blur, usually black or colored) → neo-brutalist / retro

## Deriving Missing Mode (Light ↔ Dark)

If the source has only one mode, derive the other with this formula:

### Light → Dark

For each color `"H S% L%"`:

1. Keep **hue** unchanged.
2. For backgrounds (`background`, `card`, `muted`, `secondary`, `accent`):
   - `newL = max(5, 100 - L)` — invert lightness, clamp at 5% minimum.
   - Scale saturation down slightly: `newS = S * 0.8`.
3. For foregrounds (`foreground`, `card-foreground`, `muted-foreground`):
   - `newL = min(95, 100 - L)` — invert lightness, clamp at 95% maximum.
4. For `primary` and `ring`:
   - Usually keep the same — brand colors should stay recognizable.
   - If primary is very dark (L < 30), brighten it slightly for dark mode: `newL = min(L + 15, 80)`.
5. For `destructive`:
   - Light mode: `0 84% 60%`
   - Dark mode: `0 63% 31%`
6. For `border` and `input`:
   - Light mode: near-background, slightly darker (~5% L delta).
   - Dark mode: near-background, slightly lighter (~5% L delta).

### Dark → Light

Mirror the above — invert lightness, scale saturation up slightly (`newS = S * 1.2`, clamped at 100), brighten foregrounds, darken backgrounds.

## Edge Cases

**Very colorful designs** (e.g., playful consumer apps with 4–5 accent colors): pick the most-used brand color as `primary`, the second as `accent`. Additional brand colors can go in custom tokens (`success`, `warning`, `info`), or as design inspiration in the `description` field.

**Gradient-heavy designs**: HSL doesn't capture gradients. Pick the midpoint color as the token value and note the gradient in the component styles (e.g., `"background": "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"`).

**Glass / translucent UI** (e.g., macOS-style with blur): use the opaque color as the token; note `backdrop-blur` in component styles for the agent to apply.

**Video / animated backgrounds**: capture a still frame when the video is at its most representative point. Extract colors from that frame.

## Audit Trail

When reporting back to the user after extraction, list each extracted value with a one-line justification so the user can verify:

```
Extracted from https://example.com:

Colors (light mode):
  background      0 0% 100%        — page white
  foreground      240 10% 4%       — near-black body text
  primary         245 90% 60%      — purple CTA buttons
  ...

Typography:
  sans            Inter            — closest Google Fonts match to Söhne
  mono            JetBrains Mono   — default (no mono visible in screenshot)
  ...
```

This makes errors easy to catch before the user invests in a PR.
