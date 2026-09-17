import { useEffect, useId, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useClipboard } from '@/hooks/useClipboard';
import { APP_TARGET_LABELS } from '@/lib/appTargets';
import { getCollectionLabel } from '@/lib/collections';
import {
  buildMappedThemePrompt,
  mapWebsiteToCodingTheme,
  type ConflictChoice,
} from '@/lib/themeMapping';
import type { AppTarget, DesignData, TransformedDesign } from '@/types/design';

interface CodingThemeMappingPanelProps {
  websiteUrl: string;
  websiteName: string;
  websiteData: DesignData | null;
  /** Terminal/coding themes offered as the backup. */
  backupThemes: TransformedDesign[];
  loadBackup: (slug: string) => Promise<DesignData | null>;
}

export function CodingThemeMappingPanel({
  websiteUrl,
  websiteName,
  websiteData,
  backupThemes,
  loadBackup,
}: CodingThemeMappingPanelProps) {
  const selectId = useId();
  const [backupSlug, setBackupSlug] = useState('');
  const [backupData, setBackupData] = useState<DesignData | null>(null);
  const [backupFailed, setBackupFailed] = useState(false);
  const [choices, setChoices] = useState<Record<string, ConflictChoice>>({});
  const [validated, setValidated] = useState(false);
  const [appTarget, setAppTarget] = useState<AppTarget | ''>('');
  const { copied, error: copyError, copy, resetCopy } = useClipboard<'mappedPrompt' | null>('mappedPrompt', null);

  const backup = backupThemes.find(t => t.slug === backupSlug) ?? null;

  useEffect(() => {
    let alive = true;
    setBackupData(null);
    setBackupFailed(false);
    setChoices({});
    setValidated(false);
    setAppTarget('');
    if (!backupSlug) return;
    loadBackup(backupSlug)
      .then(data => {
        if (!alive) return;
        setBackupData(data);
        setBackupFailed(data === null);
      })
      .catch(() => {
        if (!alive) return;
        setBackupData(null);
        setBackupFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [backupSlug, loadBackup]);

  const mapped = useMemo(
    () => (websiteData && backupData ? mapWebsiteToCodingTheme(websiteData, backupData, choices) : null),
    [websiteData, backupData, choices],
  );
  const hasConflicts = (mapped?.conflicts.length ?? 0) > 0;
  const canCopy = mapped !== null && (!hasConflicts || validated);
  const prompt =
    mapped && backup
      ? buildMappedThemePrompt({
          websiteUrl,
          websiteName,
          backupUrl: backup.jsonUrl,
          backupName: backup.name,
          mapped,
          choices,
          appTarget: appTarget || undefined,
        })
      : '';

  useEffect(() => {
    resetCopy();
  }, [prompt, resetCopy]);

  if (!websiteData || backupThemes.length === 0) return null;

  const setChoice = (id: string, choice: ConflictChoice) => {
    setChoices(prev => ({ ...prev, [id]: choice }));
    setValidated(false);
  };

  return (
    <section
      aria-labelledby={`${selectId}-heading`}
      className="mb-10 rounded-xl border border-border bg-card p-6"
    >
      <h2 id={`${selectId}-heading`} className="text-xs font-semibold uppercase tracking-widest text-primary">
        Use as a coding theme
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Pick a backup coding or terminal theme. Values from this website design win; the backup fills the rest.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={selectId} className="text-sm font-medium">
            Backup theme
          </label>
          <select
            id={selectId}
            value={backupSlug}
            onChange={e => setBackupSlug(e.target.value)}
            className="min-h-[44px] rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a backup theme…</option>
            {backupThemes.map(theme => (
              <option key={theme.slug} value={theme.slug}>
                {theme.name} ({getCollectionLabel(theme.collection ?? 'coding')})
              </option>
            ))}
          </select>
        </div>
        {backup && (backup.appTargets?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${selectId}-target`} className="text-sm font-medium">
              App target
            </label>
            <select
              id={`${selectId}-target`}
              value={appTarget}
              onChange={e => setAppTarget(e.target.value as AppTarget | '')}
              className="min-h-[44px] rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Any app</option>
              {backup.appTargets?.map(target => (
                <option key={target} value={target}>
                  {APP_TARGET_LABELS[target]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {backupSlug && (
        <p
          className={`text-sm ${mapped ? 'sr-only' : 'mt-4'} ${backupFailed ? 'text-destructive' : 'text-muted-foreground'}`}
          role="status"
        >
          {mapped ? '' : backupFailed ? 'Could not load the backup theme. Pick another one.' : 'Loading backup theme…'}
        </p>
      )}

      {mapped && (
        <>
          <div className="mt-6">
            <h3 className="text-sm font-semibold">
              {hasConflicts ? `Conflicts to validate (${mapped.conflicts.length})` : 'No conflicts detected'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Checked against the {mapped.defaultMode} palette. The brand-accent check covers the keyword scope only.
            </p>
            {mapped.uncheckedColors.length > 0 && (
              <p className="mt-1 text-xs text-destructive">
                Not analyzed (only H S% L% colors are checked — verify manually): {mapped.uncheckedColors.join(', ')}
              </p>
            )}
            {hasConflicts && (
              <ul className="mt-2 space-y-3">
                {mapped.conflicts.map(conflict => (
                  <li key={conflict.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-mono text-xs text-muted-foreground">{conflict.key}</p>
                    <p className="mt-1">{conflict.message}</p>
                    <p className="mt-1 text-muted-foreground">Suggestion: {conflict.suggestion}</p>
                    <fieldset className="mt-2 flex flex-wrap gap-4">
                      <legend className="sr-only">Resolution for {conflict.key}</legend>
                      <label className="inline-flex min-h-[44px] items-center gap-2">
                        <input
                          type="radio"
                          name={`${selectId}-${conflict.id}`}
                          checked={(choices[conflict.id] ?? 'suggested') === 'suggested'}
                          onChange={() => setChoice(conflict.id, 'suggested')}
                        />
                        Use suggestion ({conflict.suggestedValue})
                      </label>
                      <label className="inline-flex min-h-[44px] items-center gap-2">
                        <input
                          type="radio"
                          name={`${selectId}-${conflict.id}`}
                          checked={choices[conflict.id] === 'keep'}
                          onChange={() => setChoice(conflict.id, 'keep')}
                        />
                        Keep original ({conflict.currentValue})
                      </label>
                    </fieldset>
                  </li>
                ))}
              </ul>
            )}
            {hasConflicts && (
              <label className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={validated} onChange={e => setValidated(e.target.checked)} />
                I&rsquo;ve reviewed these choices
              </label>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p
              id={`${selectId}-copy-status`}
              className={`text-sm ${copyError ? 'text-destructive' : 'text-muted-foreground'}`}
              aria-live="polite"
            >
              {copyError
                ? `Could not copy the prompt: ${copyError}`
                : copied === 'mappedPrompt'
                  ? 'Prompt copied to clipboard.'
                  : canCopy
                    ? 'Prompt ready to copy.'
                    : 'Validate the conflict choices to copy the prompt.'}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => copy(prompt)}
              disabled={!canCopy}
              aria-describedby={`${selectId}-copy-status`}
              className="min-h-[44px] shrink-0 gap-2"
            >
              {copied === 'mappedPrompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === 'mappedPrompt' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre
            data-testid="mapped-theme-prompt"
            className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background/80 p-4 font-mono text-sm text-foreground/90"
          >
            {prompt}
          </pre>
        </>
      )}
    </section>
  );
}
