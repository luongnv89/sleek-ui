# Sleek-UI Catalog Integration

How to add an extracted design to the sleek-ui public catalog. Only runs when the skill detects it is inside the sleek-ui repository (`git remote -v | grep luongnv89/sleek-ui`).

## The Three-File Rule

Adding a design to the catalog requires **three** coordinated changes. Missing any one means the design either won't appear on the landing page or won't validate.

| # | File | Purpose | Required? |
|---|---|---|---|
| 1 | `public/designs/{slug}.json` | Raw JSON served by GitHub Pages at `luongnv.com/sleek-ui/designs/{slug}.json` | Yes |
| 2 | `src/data/designs/{slug}.json` | Copy bundled into the Vite build via `import.meta.glob` | Yes |
| 3 | `src/data/designs.ts` → `DESIGN_LIST` | Array of slugs the landing page renders | Yes |

Plus one optional but strongly recommended:

| 4 | `public/previews/{slug}-thumb.svg` | Thumbnail on the catalog grid (400×300 SVG) | Strongly recommended |

## Step-by-Step Workflow

### 1. Sanity check

Before doing anything, confirm:

```bash
git remote -v | grep -q "luongnv89/sleek-ui" && echo "ok" || echo "not sleek-ui — abort"
test -f public/schema/design.v1.json && echo "ok" || echo "wrong repo"
test -f scripts/validate-designs.js && echo "ok" || echo "wrong repo"
```

All three must succeed.

### 2. Check for existing design

```bash
test -f public/designs/{slug}.json && echo "exists" || echo "new"
```

If exists: ask the user whether to (a) skip and just print the prompt, (b) overwrite in-place, or (c) create a new slug (`{slug}-v2`, `{slug}-dark`, etc.). Never overwrite silently.

### 3. Write the raw JSON

Write `public/designs/{slug}.json` with the full schema-compliant content. Pretty-print with 2-space indentation to match existing files.

### 4. Mirror to src/data/designs

```bash
cp public/designs/{slug}.json src/data/designs/{slug}.json
```

These two files must be byte-identical. The `public/` copy is served by GitHub Pages at the canonical URL. The `src/data/` copy is bundled into the Vite build so the landing page can import it without a network round-trip.

### 5. Add the slug to DESIGN_LIST

Open `src/data/designs.ts`. Find the `DESIGN_LIST` array. Add the new slug as a string entry. Keep the array alphabetically sorted *within its grouping* (original designs at the top, then alphabetical). Example:

```ts
const DESIGN_LIST = [
  // Original designs
  'neo-brutalist',
  'warm-saas',
  ...
  // VoltAgent imports + new
  'airbnb',
  'airtable',
  ...
  '{slug}',  // ← new entry in alphabetical position
  ...
];
```

The `import.meta.glob('./designs/*.json', { eager: true })` call automatically picks up the mirrored JSON — but only slugs in `DESIGN_LIST` are rendered. Forgetting this step is the most common failure.

### 6. Generate a thumbnail SVG

Write `public/previews/{slug}-thumb.svg`. Use this template, substituting values from the extracted design:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="hsl({background})"/>
  <text x="200" y="50" text-anchor="middle" fill="hsl({foreground})"
        font-family="{sans-family}, sans-serif" font-size="20" font-weight="600">{Name}</text>
  <rect x="40" y="70" width="100" height="60" rx="{radius}" fill="hsl({muted})" stroke="hsl({border})" stroke-width="1"/>
  <rect x="160" y="70" width="100" height="60" rx="{radius}" fill="hsl({primary})"/>
  <rect x="280" y="70" width="80" height="60" rx="{radius}" fill="hsl({accent})"/>
  <rect x="40" y="150" width="320" height="100" rx="{radius}" fill="hsl({card})" stroke="hsl({border})" stroke-width="1"/>
  <rect x="60" y="170" width="80" height="30" rx="{sm-radius}" fill="hsl({primary})"/>
  <rect x="160" y="170" width="80" height="30" rx="{sm-radius}" fill="hsl({secondary})"/>
  <rect x="260" y="170" width="80" height="30" rx="{sm-radius}" fill="hsl({accent})"/>
  <text x="200" y="280" text-anchor="middle" fill="hsl({muted-foreground})"
        font-family="{sans-family}, sans-serif" font-size="12">Thumbnail</text>
</svg>
```

Substitute each `{...}` with the actual extracted value. The HSL values here **do** use the `hsl()` wrapper because this is SVG, not CSS custom properties.

Also update the JSON's `preview.thumbnail` field:

```json
"preview": {
  "thumbnail": "/previews/{slug}-thumb.svg"
}
```

### 7. Validate

```bash
npm run validate:designs
```

This compiles the AJV schema and validates every file in `public/designs/`. If the new design fails, read the error output, fix the JSON, and re-run. Do **not** proceed to commit until this passes.

If other (unrelated) designs fail validation, those are pre-existing issues — do not try to fix them in this PR. Note them to the user and proceed only if the new design itself passes.

### 8. Create a branch

```bash
git checkout -b feat/design-{slug}
```

Follow the repo's branch naming: `feat/design-{slug}` for new designs. If refreshing an existing design: `refactor/design-{slug}`.

### 9. Commit

Use Conventional Commits format. Single commit for the whole design:

```bash
git add public/designs/{slug}.json src/data/designs/{slug}.json src/data/designs.ts public/previews/{slug}-thumb.svg
git commit -m "feat(designs): add {Name} design system

Extracted from {source — URL or screenshot}. Includes light and dark
mode tokens, Google Fonts configuration, component styles, and thumbnail.
"
```

Never `git add -A` — only add the specific four files. This prevents accidentally committing unrelated working-tree changes.

### 10. Push

```bash
git push -u origin feat/design-{slug}
```

### 11. Create the PR

```bash
gh pr create --title "feat(designs): add {Name} design system" --body "$(cat <<'EOF'
## Summary

Adds the **{Name}** design system to the sleek-ui catalog.

**Source**: {URL or screenshot reference}

## Changes

- `public/designs/{slug}.json` — schema-compliant design tokens
- `src/data/designs/{slug}.json` — Vite-bundled mirror
- `src/data/designs.ts` — added `'{slug}'` to `DESIGN_LIST`
- `public/previews/{slug}-thumb.svg` — catalog thumbnail

## Tokens extracted

| Token | Value |
|---|---|
| `primary` | `{value}` |
| `background` | `{value}` |
| `foreground` | `{value}` |
| `sans font` | `{family}` |
| `radius` | `{value}` |

## Checklist

- [x] JSON validates against schema (`npm run validate:designs`)
- [x] Both light and dark modes present
- [x] Mirrored to `src/data/designs/`
- [x] Added to `DESIGN_LIST`
- [x] Thumbnail generated
- [ ] Reviewed tokens against the source
EOF
)"
```

Return the PR URL to the user.

## Refresh Workflow (Design Already Exists)

If the user is updating an existing design instead of adding a new one:

1. Skip the `DESIGN_LIST` edit (slug already present).
2. Overwrite `public/designs/{slug}.json` and `src/data/designs/{slug}.json` with new content.
3. Regenerate the thumbnail only if colors changed.
4. Branch name: `refactor/design-{slug}-refresh`.
5. Commit message: `refactor(designs): refresh {Name} design tokens`.
6. PR body should include a diff summary — which tokens changed and why.

## Common Failures

**"Design not appearing on the landing page"** — you forgot step 5 (DESIGN_LIST). The file exists in both `public/` and `src/data/`, but the React component only renders slugs in the array.

**"validate:designs fails with 'missing required property'"** — the schema requires all color tokens in both `light` and `dark`. Check you didn't skip `destructive-foreground` or `ring`.

**"validate:designs fails with HSL pattern mismatch"** — a color value has `hsl(…)` wrapper, commas, or missing `%`. See `references/schema-guide.md` for the exact format.

**"Thumbnail shows as broken image"** — the `preview.thumbnail` path must start with `/previews/`, not `./previews/` or `previews/`. GitHub Pages serves from the repo root.
