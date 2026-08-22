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

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value?: string, copiedFlag: T = flag): Promise<boolean> => {
      if (!value || !navigator.clipboard) {
        setError('Cannot copy empty text');
        return false;
      }
      try {
        await navigator.clipboard.writeText(value);
        setError(null);
        setCopied(copiedFlag);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(reset), COPY_FEEDBACK_MS);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to copy text');
        clearTimeout(timer.current);
        // Errors auto-clear on the same window as success so stale feedback
        // never sticks around permanently (#140).
        timer.current = setTimeout(() => setError(null), COPY_FEEDBACK_MS);
        return false;
      }
    },
    [flag, reset]
  );

  return { copied, error, copy } as const;
}
