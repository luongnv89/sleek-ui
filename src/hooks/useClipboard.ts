import { useState, useCallback } from 'react';

export const useClipboard = (copyTimeout: number = 2000) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      if (!text) {
        throw new Error('Cannot copy empty text');
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      // Reset copied state after timeout
      setTimeout(() => {
        setCopied(false);
      }, copyTimeout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy text');
      setCopied(false);
      throw err;
    }
  }, [copyTimeout]);

  return { copied, error, copy };
};
