import { useEffect, useState } from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PromptSurface, promptBodyProps } from '@/components/ui/PromptSurface';
import { useClipboard } from '@/hooks/useClipboard';
import { buildWebsiteCopyPrompt, normalizeWebsiteUrl } from '@/lib/websiteCopyPrompt';

/** Stable section id — in-page navigation is scrollIntoView, never #hrefs (#104/#147). */
export const COPY_SITE_SECTION_ID = 'copy-site';

/** In-product name of the capability, reused as the form's accessible name. */
const FEATURE_NAME = 'Copy a Site';

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
    <section
      id={COPY_SITE_SECTION_ID}
      aria-labelledby="copy-site-heading"
      className="border-t border-border/60 bg-muted/30 px-gutter py-band sm:py-band-lg"
    >
      <div className="mx-auto max-w-narrow">
        <div className="text-center">
          <p className="font-mono text-eyebrow uppercase text-primary-text">{FEATURE_NAME}</p>
          <h2
            id="copy-site-heading"
            className="mt-stack text-headline font-extrabold text-foreground sm:text-display"
          >
            Turn any website into an agent prompt
          </h2>
          <p className="mt-stack text-lede text-muted-foreground">
            Paste the URL of a site whose design you want. You get a prompt that walks your agent
            through extracting its theme, style, and design details — then applying them to your
            project, with your approval at every step.
          </p>
        </div>

        {/* What it takes in, what it hands back — before the form, so the visitor
            knows what they are about to get (#196 AC2). */}
        <dl className="mt-flow grid gap-grid sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-gutter">
            <dt className="font-mono text-eyebrow uppercase text-muted-foreground">You give</dt>
            <dd className="mt-1.5 text-label font-semibold text-foreground">
              One public website URL
            </dd>
            <dd className="mt-1 text-micro text-muted-foreground">
              No account, no API key, nothing to install.
            </dd>
          </div>
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-gutter dark:border-primary/50 dark:bg-primary/10">
            <dt className="font-mono text-eyebrow uppercase text-primary-text">You get</dt>
            <dd className="mt-1.5 text-label font-semibold text-foreground">
              A three-phase agent prompt
            </dd>
            <dd className="mt-1 text-micro text-muted-foreground">
              Research, then plan, then implement — the agent stops for your approval between each.
            </dd>
          </div>
        </dl>

        <form
          onSubmit={handleSubmit}
          aria-label={`${FEATURE_NAME} prompt generator`}
          className="mt-flow flex flex-col gap-stack sm:flex-row"
        >
          <div className="flex-1">
            <label htmlFor="copy-site-url" className="mb-1.5 block text-label font-medium">
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
          <p id="copy-site-url-error" role="alert" className="mt-stack text-label text-red-600 dark:text-red-400">
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
          <PromptSurface
            className="mt-flow"
            label="Your agent prompt"
            description="Copy this, then paste it into Claude Code, Cursor, or any agent."
            actions={
              <Button
                type="button"
                onClick={() => copy(prompt)}
                aria-label={copyError ? `Copy failed: ${copyError}. Click to try again` : undefined}
                title={copyError ?? undefined}
                className="min-h-[44px] shrink-0 gap-2"
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
            }
          >
            <pre {...promptBodyProps({ label: 'Generated prompt', className: 'break-all' })}>
              {prompt}
            </pre>
          </PromptSurface>
        )}
      </div>
    </section>
  );
}
