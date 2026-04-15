# Defensive Programming Removal — Wave 2

**Result: no findings**

## Rationale

Scanned all `try/catch`, `?.`, and `??` occurrences across `src/`. Every defensive
pattern found sits at a legitimate boundary or is explicitly protected by the
task brief:

| Location | Pattern | Why kept |
|---|---|---|
| `src/hooks/useClipboard.ts` | (file removed in Wave 1) | n/a |
| `src/components/ui/CopyButton.tsx:27-41` | try/catch around `navigator.clipboard.writeText` with error state + `onCopy(false)` callback | Clipboard API legitimately fails (permissions, insecure contexts); task brief says KEEP. Catch produces user-visible error UI via `setError` + `AlertCircle` icon. |
| `src/context/ThemeContext.tsx:14-21` | try/catch around `localStorage.getItem` | localStorage legitimately fails (Safari private mode, SSR, disabled storage). Task brief lists localStorage reads as a real boundary. |
| `src/context/DesignContext.tsx:103-108` | try/catch around `localStorage.getItem` + `JSON.parse` | Both localStorage and JSON.parse on external string are real boundaries. Task brief explicitly protects DesignContext. |
| `src/context/DesignContext.tsx:115` | `getElementById('sleek-applied-design')?.textContent ?? ''` | `getElementById` genuinely returns `Element \| null` per DOM API. |
| `src/context/DesignContext.tsx:76-78` | `radius?.default ?? '0.5rem'`, `typography?.fontFamily?.sans ?? ...` | Operates on user-authored design JSON where optional schema fields may be absent. |
| `src/context/DesignContext.tsx:39,48` | `data.fonts?.urls?.length`, `data.fonts?.google?.length` | Same: external JSON, schema-optional fields. |
| `src/context/DesignContext.tsx:31` | `document.getElementById(id)?.remove()` | DOM API genuinely nullable. |
| `src/data/designs.ts:8,13,15,18,20,24` | `designJson.tokens?.colors?.[mode] \|\| ...` etc. | Operates on user-authored JSON (`DesignData`) — schema is optional at these levels. Validation is separate; runtime transform must be tolerant. |
| `src/components/catalog/DesignCard.tsx:13` | `design.rawData?.tokens?.colors?.[mode] ?? ... ?? {}` | Same — user-authored JSON boundary. |
| `src/components/DesignDetail.tsx:82` | `appliedDesign?.slug === slug` | `appliedDesign` is typed `AppliedDesign \| null` in context. |
| `src/components/DesignDetail.tsx:163` | `design && designData && applyDesign(...)` | `designData` is separate state, can be null before effect fires; not redundant with the `if (!design)` guard above. |
| `src/components/DesignCard.tsx:44` | `onClick?.(design)` | `onClick` is declared optional. |
| `src/components/ui/CopyButton.tsx:31,40` | `onCopy?.(...)` | `onCopy` is declared optional in `CopyButtonProps`. |
| `src/App.tsx:132,138` | `document.getElementById(...)?.scrollIntoView(...)` | DOM API genuinely nullable. |
| `src/components/TokenTable.tsx:118` | `lightColors[key] \|\| ''` | Index lookup over union of light+dark keys — key may not exist in lightColors. |

No candidate passed the "safe to remove" bar. Per the "be CONSERVATIVE" rule,
nothing was removed. No commit created.
