# tailwind-merge v2 → v3 upgrade spike (issue #110)

Upgraded `tailwind-merge` from 2.6.1 to ^3.6.0 while Tailwind CSS remains at
v3.4.19 (Tailwind v4 upgrade is tracked separately in #115).

## Key behavior change in v3

tailwind-merge v3 ships its default class-group config for **Tailwind CSS v4**.
The upstream README states: "Supports Tailwind v4.0 up to v4.3 (if you use
Tailwind v3, use tailwind-merge v2.6.0)". The main v4 renames that could affect
merging are scale shifts (`shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`,
`blur-sm`→`blur-xs`, etc.) and new/renamed class groups.

## Verification against this repo's Tailwind v3 output

All conflict-resolution behaviors used by this repo's components were verified
empirically against tw-merge 3.6.0 with real Tailwind v3 classes:

| Case | Result |
|------|--------|
| `px-2 py-1` + `px-4` | `py-1 px-4` ✓ |
| button base + caller `bg-blue-500` | variant bg removed ✓ |
| `p-6 pt-0` + `p-8` | `p-8` ✓ (shorthand beats axis) |
| `rounded-md` + `rounded-full` / `rounded-lg` | later wins ✓ |
| `ring-2 ring-ring ring-offset-2` + `ring-4` | width merged, colors kept ✓ |
| `text-sm text-muted-foreground` + `text-xs` | size merged, color kept ✓ |
| `hover:` / `dark:` variants merge independently of base ✓ |
| arbitrary values (`w-[120px]`) vs named scales ✓ |

No v3→v4 config drift affects any class group this codebase uses
(spacing, sizing, rounded, ring, shadow, text, flex/grid, colors, variants).
The regression suite lives in `src/lib/utils.test.js`. If the Tailwind v4
upgrade (#115) lands, revisit shadow/rounded/blur scale expectations there.
