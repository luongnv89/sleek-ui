import { useEffect, useState } from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useClipboard } from '@/hooks/useClipboard';
import { buildWebsiteCopyPrompt, normalizeWebsiteUrl } from '@/lib/websiteCopyPrompt';

export function CopySiteSection() {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { copied, error: copyError, copy, resetCopy } = useClipboard<'prompt' | null>('prompt', null);

  // Clear stale "Copied!" feedback whenever a new prompt is generated.
  useEffect(() => {
    resetCopy();
  }, [prompt, resetCopy]);

  // Copy outcomes are recorded as the last announcement so the status never
  // reverts to a stale "Prompt generated" message once the flags auto-clear.
  useEffect(() => {
    if (copyError) {
      setStatusMessage(`Copy failed: ${copyError}. Activate Copy to try again.`);
    } else if (copied === 'prompt') {
      setStatusMessage('Prompt copied to clipboard.');
    }
  }, [copied, copyError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetUrl = normalizeWebsiteUrl(url);
    if (!targetUrl) {
      if (url.trim()) setFormError('Enter a valid website URL, e.g. example.com');
      setPrompt('');
      setStatusMessage('');
      return;
    }
    setFormError(null);
    setPrompt(buildWebsiteCopyPrompt(targetUrl));
    setStatusMessage(`Prompt generated for ${targetUrl} — review it below.`);
  };

  return (
    <section id="copy-site" className="border-t border-border/60 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Copy a site you love</h2>
          <p className="mt-2 mx-auto max-w-xl text-muted-foreground">
            Paste the URL of any website. You get a prompt that walks your agent through extracting its
            theme, style, and design details — then applying them to your project, with your approval at
            every step.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-label="Website-copy prompt generator"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex-1">
            <label htmlFor="copy-site-url" className="mb-1.5 block text-sm font-medium">
              Website URL
            </label>
            <Input
              id="copy-site-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              value={url}
              onChange={event => {
                setUrl(event.target.value);
                setFormError(null);
              }}
              placeholder="https://example.com"
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? 'copy-site-url-error' : undefined}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!url.trim()}
            className="min-h-[44px] shrink-0 sm:self-end"
          >
            Generate prompt
          </Button>
        </form>

        {formError && (
          <p id="copy-site-url-error" role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {formError}
          </p>
        )}

        {/* Persistent live region: mounted before any announcement so the first
            message is reliably delivered (regions added already-populated can be
            missed by VoiceOver/Safari), and kept short so the prompt itself is
            never read aloud. */}
        <p role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </p>

        {prompt && (
          <div className="mt-8 rounded-xl border border-border bg-background p-5 sm:p-6 shadow-xs">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Copy this prompt. Paste into Claude, Cursor, or any agent.
              </p>
              <Button
                type="button"
                onClick={() => copy(prompt)}
                aria-label={copyError ? `Copy failed: ${copyError}. Click to try again` : undefined}
                title={copyError ?? undefined}
                className="min-h-[44px] shrink-0 gap-2 self-start sm:self-auto"
              >
                {copyError ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : copied === 'prompt' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'prompt' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre
              role="region"
              aria-label="Generated prompt"
              tabIndex={0}
              className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-muted/60 p-3 sm:p-4 font-mono text-xs sm:text-sm text-foreground/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {prompt}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
