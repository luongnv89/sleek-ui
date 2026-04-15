# Deduplicator — Wave 2

## State on entry

Wave 1 (unused-code-killer + slop-comment-cleaner) had NOT committed its work
before this subagent ran. The working tree contained uncommitted deletions and
modifications from Wave 1. This subagent picked those up and included them in
its single commit. Flag for user: Wave 1 subagents should normally commit
before handing off.

## Pairs merged / deletions

### Pair 1 — CopyButton
- `src/components/CopyButton.tsx` (40 lines, ad-hoc) — **DELETED** (by Wave 1, uncommitted).
- `src/components/ui/CopyButton.tsx` — kept as canonical primitive. Uses
  `CopyButtonProps` from `src/types/components.ts`.
- No import updates needed — nothing in the live tree imported the non-ui
  variant except the also-deleted `components/DesignCard.tsx`.

### Pair 2 — DesignCard
- `src/components/DesignCard.tsx` (150 lines) — **DELETED** (by Wave 1, uncommitted).
- `src/components/catalog/DesignCard.tsx` — kept as canonical catalog card.
  Imported by `src/App.tsx`.

### Pair 3 — useClipboard hook
- `src/hooks/useClipboard.ts` — **DELETED** (by Wave 1, uncommitted).
- The hook was defined but never imported. The surviving
  `components/ui/CopyButton.tsx` has its own inline clipboard logic
  (useState + navigator.clipboard.writeText). Per rules ("Prefer deletion of
  one duplicate over extracting a new shared module"), deletion is the correct
  resolution — extracting/re-wiring the hook for a single caller is premature
  abstraction.

### Pair 4 — design types (this subagent's work)
- `src/types/design.ts` was a one-line re-export shim pointing to
  `src/types/design-types.ts`. Both filenames were imported throughout the
  codebase (5 sites → `design`, 1 site → `design-types`).
- Consolidated all type definitions into `src/types/design.ts`.
- **DELETED** `src/types/design-types.ts`.
- **Updated** `src/context/DesignContext.tsx`:
  `@/types/design-types` → `@/types/design`.

## Also included in commit (Wave 1 leftovers)

- D `src/components/catalog/FilterBar.tsx`
- D `src/components/index.ts`
- D `src/components/ui/index.ts`
- D `src/components/ui/variants.ts`
- M `src/components/ui/SearchBar.tsx` (comment removals)
- M `src/components/ui/badge.tsx` (comment removal)
- M `src/components/DesignDetail.tsx` (comment removals)

## Flagged for user review

1. **Wave 1 subagents did not commit.** Their deletions/edits were rolled into
   this commit. If each wave is meant to produce an isolated commit for audit,
   re-run with a commit-enforcement check between waves.
2. **Inline Tailwind class clusters:** Per instructions, not extracted.
   Noted minor repetition of focus-ring class sequences across
   `ui/CopyButton.tsx`, `ui/SearchBar.tsx`, and
   `components/DesignDetail.tsx`, but extracting would be premature
   abstraction — leaving inline as directed.
3. **No clipboard hook remains.** If you later want shared clipboard logic
   (e.g. a second copy-button variant appears), re-introduce `useClipboard`
   then — don't pre-wire it now.

## Verification

- `npm run build` — pass (1649 modules transformed, 480 kB bundle).
- `npm run validate:designs` — pass (all designs valid).
- `npm test` — pass (10/10 tests).
