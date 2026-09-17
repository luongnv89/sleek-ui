import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useClipboard } from '@/hooks/useClipboard';
import { buildWebsiteCopyPrompt } from '@/lib/websiteCopyPrompt';

export function CopySiteSection() {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const { copied, copy, resetCopy } = useClipboard<'prompt' | null>('prompt', null);

  // Clear stale "Copied!" feedback whenever a new prompt is generated.
  useEffect(() => {
    resetCopy();
  }, [prompt, resetCopy]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return;
    setPrompt(buildWebsiteCopyPrompt(url));
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
          <Input
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={url}
            onChange={event => setUrl(event.target.value)}
            placeholder="https://example.com"
            aria-label="Website URL to copy"
            className="h-11 flex-1"
          />
          <Button type="submit" size="lg" disabled={!url.trim()} className="min-h-[44px] shrink-0">
            Generate prompt
          </Button>
        </form>

        {prompt && (
          <div className="mt-8 rounded-xl border border-border bg-background p-5 sm:p-6 shadow-xs">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Copy this prompt. Paste into Claude, Cursor, or any agent.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => copy(prompt)}
                className="shrink-0 gap-2 self-start sm:self-auto"
              >
                {copied === 'prompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === 'prompt' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/60 p-3 sm:p-4 font-mono text-xs sm:text-sm text-foreground/90">
              {prompt}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
