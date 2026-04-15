# Slop Comment Cleaner - Wave 1

Note: a parallel orchestrator run (commits `23e2a2e`, `c790d02`) removed a broader set of
slop comments / unused code during this wave. The remaining AI-generated / low-value comments
in the scope were cleaned here.

## Files touched

| File | Lines removed | Category |
|---|---:|---|
| `src/context/DesignContext.tsx` | 5 | WHAT restatement |
| `src/components/ui/CategoryFilter.tsx` | 6 | JSDoc-repeats-name + JSX section markers |
| `scripts/ingest-designs.js` | 1 | WHAT restatement |

Total: 12 comment lines removed.

## Representative removals

- `src/context/DesignContext.tsx`
  - `// Inject or update a <style> tag with a given id` above `function upsertStyle(id, css)` —
    the name already says this.
  - `// Load Google Fonts for the design` above `function loadFonts(data)` — name says it.
  - `// Remove previous design font links` above `document.querySelectorAll('link[data-sleek-font]').forEach(el => el.remove())` — the selector already names the target.
  - `// Build Google Fonts URL from the google field` — the code below literally builds the URL
    from `data.fonts.google`.
  - `// Store original CSS vars on first mount so we can reset` — the useRef + useEffect below
    is the standard idiom; name `originalCssRef` is self-documenting.

- `src/components/ui/CategoryFilter.tsx`
  - JSDoc block `/** CategoryFilter component / Pill-style filter component... */` above an
    already-named component with already-named props. No non-obvious info.
  - `{/* All / Reset button */}` and `{/* Individual category pills */}` JSX section markers.

- `scripts/ingest-designs.js`
  - `// Match H2 headers (## Section Name)` above `if (line.startsWith('## '))` — line says it.

## Kept (deliberately)

- `// Format: - **Color Name** (\`#hexcode\`): description` in `extractColorsFromSection` —
  documents the markdown grammar the regex below targets. Non-obvious WHY/format note.
- `// Pick primary / Pick dark bg / Pick light bg / Pick foreground` comments in
  `convertToSleekUi` — each one explains the heuristic (e.g. "darkest color by lightness"),
  which is not obvious from the code alone.
- CSS section comments in `src/index.css` (e.g. "Catalog Light Mode — A neutral, clean palette
  that showcases all designs well") — add intent/rationale beyond what the properties show.
- Shebang and `/** @type {import('tailwindcss').Config} */` directive in `tailwind.config.js`.
