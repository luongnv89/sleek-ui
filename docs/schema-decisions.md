# Schema Decisions Log

This document tracks decisions about the `design.v1.json` schema evolution.

---

## 2026-09-17: motion tokens and external libraries

### Decision: **Accept** — add optional `tokens.motion` and top-level `libraries`

### Rationale

Issue #186 asks design extraction to capture animation/motion behavior and to identify the external animation libraries needed to reproduce it.

1. **Semantic tokens over config dumps (#38 precedent)**: the 2026-03-29 entry rejected a raw `tailwindConfig` field in favor of semantic tokens + `agentInstructions`. This change formalizes exactly the animation/keyframes slice that the rejected prototype sketched (see its `theme.extend.animation`/`keyframes` example above) — but expressed as named, framework-agnostic primitives rather than Tailwind config. Serialization to Tailwind v4 (`--animate-{name}` theme keys + `@keyframes`) happens in the generated agent prompt, not in the JSON.
2. **DTCG-aligned value shapes**: `duration`/`delay` accept `'150ms'`-style strings or `{value, unit}` objects; `easing` accepts CSS keyword/library-name strings or cubic-bezier control points as 4-number arrays (W3C DTCG `$type: 'cubicBezier'`). Arrays instead of `'cubic-bezier(...)'` function strings because `SAFE_TOKEN_VALUE` in `src/context/DesignContext.tsx` rejects parentheses in token values.
3. **Fully additive**: both fields are optional; the schema has no `additionalProperties: false`, so all 68 existing catalog designs validate unchanged (AC6). `accessibility.reducedMotion` semantics (prd.md §5.4) are untouched — motion extraction is additive, and extraction guidance instructs honoring `prefers-reduced-motion` at apply time.
4. **`libraries` carries safe installation info**: `name`, schema-constrained npm `package`, and `purpose` are required per entry (`version` optional and semver-constrained). Generated prompts derive package-manager guidance from those structured fields; free-form installation commands are rejected.
5. **Graceful degradation**: extraction guidance mandates omitting both fields when motion cannot be observed (screenshot-only inputs, no JS evaluation, bundler-erased names) — never fabricate.

### Related References

- Issue: #186
- Prior decision: 2026-03-29 tailwindConfig rejection (#38)
- Constraint: `SAFE_TOKEN_VALUE` regex in `src/context/DesignContext.tsx`
- PRD: §5.4 (reduced motion)

---

## 2026-03-29: tailwindConfig override field

### Decision: **Reject** - Do not add to schema

### Rationale

After investigating the feature request (Task 4.5, Issue #38), the `tailwindConfig` override field should be rejected for the following reasons:

1. **Sufficient coverage via existing tokens**: The current schema already covers the most impactful Tailwind config domains:
   - `tokens.colors` → Covers Tailwind `theme.colors` (all 20+ color slots)
   - `tokens.typography` → Covers `theme.fontFamily`, `theme.fontSize`, `theme.fontWeight`, `theme.lineHeight`, `theme.letterSpacing`
   - `tokens.radius` → Covers `theme.borderRadius`
   - `tokens.spacing` → Covers `theme.spacing`
   - `tokens.shadows` → Covers `theme.boxShadow`

2. **Semantic abstraction is superior**: Design systems should express intent in semantic tokens (e.g., `primary`, `background`) rather than implementation details (e.g., `hsl(240 33% 14%)`). Direct tailwindConfig overrides would bypass this abstraction layer.

3. **Agent guidance via agentInstructions**: The `agentInstructions.steps` field already provides clear instructions for applying the design. Adding raw config would fragment the application logic.

4. **Complexity vs. benefit**: A `tailwindConfig` field would require complex merging logic (deep merge? replace? extend?) and would increase schema complexity without proportional agent fidelity benefit.

5. **Existing solutions are adequate**: For projects needing additional Tailwind config (e.g., custom plugins, screens, animations), agents can be instructed to merge additional config in a follow-up step.

### Future Considerations (Phase 3+)

If the need arises for more complex Tailwind customizations, consider:

1. **Plugin configuration**: Add a `plugins` array with plugin names and options
2. **Custom utilities**: Add a `utilities` field for custom Tailwind utilities
3. **Theme extensions only**: If needed, add `themeExtensions` that merge into existing theme rather than replace

### Implementation Details

**Prototype (not implemented)** - What the field would have looked like:

```json
{
  "tailwindConfig": {
    "content": ["./src/**/*.{js,ts,jsx,tsx}"],
    "theme": {
      "extend": {
        "colors": {
          "custom": {
            "primary": "hsl(var(--primary))"
          }
        },
        "animation": {
          "fade-in": "fadeIn 0.3s ease-in-out"
        },
        "keyframes": {
          "fadeIn": {
            "0%": {"opacity": "0"},
            "100%": {"opacity": "1"}
          }
        }
      }
    },
    "plugins": ["@tailwindcss/forms", "@tailwindcss/typography"]
  }
}
```

### Related References

- Issue: #38
- Task: 4.5
- PRD: §9.1 OQ1, §3.2 F14
- Tasks file: `tasks.md` (line 692)

---

*Last updated: 2026-09-17*
