import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Single source of truth for how long "copied" feedback stays visible.
 * Every clipboard consumer uses this instead of its own literal so the
 * feedback window can never drift apart between components.
 */
export const COPY_FEEDBACK_MS = 1500;

/**
 * Copy-to-clipboard with transient "copied" feedback that is cancelled on
 * unmount. `flag` is the value written to state while copied (a boolean for
 * single-target buttons, or `'l' | 'd'` for two-target swatches); `reset` is
 * the value it returns to. The pending timer is tracked in a ref and cleared
 * on unmount so the timeout never fires setState on an unmounted component.
 *
 * Rejections (denied permission, insecure context) surface through `error`
 * instead of throwing — callers choose whether to render them; there is no
 * unhandled promise rejection either way. `copy` resolves to whether the
 * write succeeded.
 *
 * This is the ONLY place outside tests that references navigator.clipboard.
 */
export function useClipboard<T>(flag: T, reset: T) {
  const [copied, setCopied] = useState<T>(reset);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Bumped on every copy() call and resetCopy() so a still-pending writeText
  // can never resurrect feedback for a target that was already replaced.
  const generation = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value?: string, copiedFlag: T = flag): Promise<boolean> => {
      const gen = ++generation.current;
      // Every failure funnels through here: a stale "copied" flag is reset,
      // and errors auto-clear on the same window as success so feedback never
      // sticks around permanently (#140). A superseded call touches nothing.
      const fail = (message: string): false => {
        if (generation.current !== gen) return false;
        setCopied(reset);
        setError(message);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setError(null), COPY_FEEDBACK_MS);
        return false;
      };
      if (!navigator.clipboard) {
        // Distinct from an empty payload: insecure contexts and old browsers
        // simply lack the API, so "empty text" would be a wrong diagnosis.
        return fail('Clipboard API is not available');
      }
      if (!value) return fail('Cannot copy empty text');
      try {
        await navigator.clipboard.writeText(value);
        if (generation.current !== gen) return false;
        setError(null);
        setCopied(copiedFlag);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(reset), COPY_FEEDBACK_MS);
        return true;
      } catch (err) {
        return fail(err instanceof Error ? err.message : 'Failed to copy text');
      }
    },
    [flag, reset]
  );

  const resetCopy = useCallback(() => {
    generation.current += 1;
    clearTimeout(timer.current);
    setCopied(reset);
    setError(null);
  }, [reset]);

  return { copied, error, copy, resetCopy } as const;
}
