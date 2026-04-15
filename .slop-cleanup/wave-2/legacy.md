# Wave 2 — Legacy Code Removal Findings

## Scope
- Target: `src/` only
- Branch: `chore/slop-cleanup-20260415`
- Parallel subagent: deduplicator was actively modifying `src/components/` during this run (CopyButton / DesignCard / FilterBar / index.ts / variants.ts / useClipboard / SearchBar / badge.tsx). Those files were intentionally skipped by this subagent to avoid conflicts.

## Patterns scanned
| Pattern | Hit? | Notes |
|---|---|---|
| `*_old`, `*_legacy`, `*_v1`, `*.bak`, `*.deprecated` filenames | none | Clean |
| `@deprecated` markers | none | Clean |
| Migration shim / dual-shape data branches | none | `loadFonts` has two code paths for `fonts.urls` vs `fonts.google`, but both are live across different design JSON files in `src/data/designs/` |
| Hardcoded `if (featureFlag)` / `if (true)` / `if (false)` | none | Clean |
| Commented-out code blocks | 1 found (see below) | Fixed |
| Dead imports | none found in this pass | Deduplicator may uncover more |
| `design.ts` vs `design-types.ts` duplicate types | flagged — owned by deduplicator | `design.ts` is a thin re-export of `design-types.ts`; left alone per scope |

## Edits
### `src/context/DesignContext.tsx`
Removed a block of confused, self-contradicting AI "train of thought" comments inside the restore-CSS `useEffect`. The original text claimed "we can't re-apply (no data) — clear it" followed immediately by "Actually, store the CSS separately so we can restore it". The code DOES restore CSS from `localStorage` on mount, so the earlier comment lines were stale and misleading. Replaced with a single accurate one-liner.

No code behavior changed.

## Verification
- `npm run build` — ok (480.16 kB bundle, unchanged size)
- `npm run validate:designs` — all designs valid
- `npm test` — 10/10 passing

## Not touched (owned by deduplicator subagent)
- `src/components/CopyButton.tsx` vs `src/components/ui/CopyButton.tsx`
- `src/components/DesignCard.tsx` vs `src/components/catalog/DesignCard.tsx`
- `src/components/catalog/FilterBar.tsx` deletion
- `src/components/{index.ts,ui/index.ts,ui/variants.ts}` barrel/re-export deletions
- `src/hooks/useClipboard.ts` deletion
- `src/components/ui/SearchBar.tsx` and `src/components/ui/badge.tsx` comment pruning
- `src/types/design.ts` re-export file

## Commit
Single commit: `chore(legacy): drop stale comment block in DesignContext restore-CSS effect`
