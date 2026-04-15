# Unused Code Killer — Report

Branch: `chore/slop-cleanup-20260415`
Scope: `src/` and `scripts/` (excluding `video/`, `public/`, `node_modules/`, `dist/`).

## Files deleted

| File | Lines | Reason |
|---|---:|---|
| `src/components/CopyButton.tsx` | 40 | Duplicate of `src/components/ui/CopyButton.tsx`. Only referenced by the (also-unused) top-level `DesignCard.tsx`. App uses the `ui/` version. |
| `src/components/DesignCard.tsx` | 150 | Duplicate of `src/components/catalog/DesignCard.tsx`. `App.tsx` imports `@/components/catalog/DesignCard` — the top-level copy had no importers. |
| `src/components/catalog/FilterBar.tsx` | 63 | Never imported anywhere. App composes `SearchBar` + `CategoryFilter` directly instead. |
| `src/components/index.ts` | 2 | Orphan barrel. Not imported anywhere and re-exported names (`Badge`, `Button`, `DesignCategoryBadge`, `Header`, `ThemeToggle`, etc.) that do not exist in `./ui` (broken re-export). |
| `src/components/ui/index.ts` | 3 | Orphan barrel. Not imported anywhere — all call sites import directly from `@/components/ui/<Component>`. |
| `src/components/ui/variants.ts` | 3 | Thin re-export of `cva` from `class-variance-authority`. Never imported — `button.tsx` and `badge.tsx` import `cva` directly from the package. |
| `src/hooks/useClipboard.ts` | 29 | Never imported anywhere. Components (`CopyButton`, `DesignDetail`) use `navigator.clipboard.writeText` directly. The entire `src/hooks/` directory was removed. |

**Total: 7 files, 290 lines removed.**

## Exports deleted

All exports belonged to the files deleted above:

- `src/components/CopyButton.tsx:CopyButton`
- `src/components/DesignCard.tsx:DesignCard`
- `src/components/catalog/FilterBar.tsx:FilterBar`
- `src/components/index.ts:*` (broken barrel re-exports)
- `src/components/ui/index.ts:CopyButton, CopyButtonProps, SearchBar, SearchBarProps, CategoryFilter, CategoryFilterProps` (barrel re-exports only)
- `src/components/ui/variants.ts:cva`
- `src/hooks/useClipboard.ts:useClipboard`

## Flagged but not deleted

- `src/types/components.ts` — Props types (`CopyButtonProps`, `SearchBarProps`, `CategoryFilterProps`) are actively imported by the `ui/` components. Keep.
- `src/types/design.ts` — Thin facade that re-exports from `./design-types`. Used by `src/data/designs.ts` and `src/components/TokenTable.tsx`. Keep (removing would require touching multiple files; low value).
- `scripts/ingest-designs.js` — Per task instructions, intentional data; left untouched.
- Top-level catch-all: no other orphan source files detected in `src/` after the above removals.

## Verification

After deletion, all three checks passed:

- `npm run build` — 1649 modules transformed, built successfully
- `npm run validate:designs` — all designs valid
- `npm test` — 10/10 tests passing
