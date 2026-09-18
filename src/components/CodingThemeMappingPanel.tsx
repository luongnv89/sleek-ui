import { useEffect, useId, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PromptSurface, promptBodyClassName } from '@/components/ui/PromptSurface';
import { ThemePairTriad } from '@/components/ui/ThemePairTriad';
import { useClipboard } from '@/hooks/useClipboard';
import { APP_TARGET_LABELS } from '@/lib/appTargets';
import { getCollectionLabel } from '@/lib/collections';
import {
  buildMappedThemePrompt,
  mapWebsiteToCodingTheme,
  type ConflictChoice,
} from '@/lib/themeMapping';
import type { AppTarget, DesignData, TransformedDesign } from '@/types/design';

const selectClass =
  'min-h-[44px] w-full rounded-md border border-input bg-background px-3 text-label focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring';

/** Decorative swatch row for a design's light palette. */
function paletteSwatches(scale: Record<string, string> | undefined): string[] {
  return ['primary', 'background', 'foreground']
    .map(key => scale?.[key])
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map(value => `hsl(${value})`);
}

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

  const showAppTarget = backup !== null && (backup.appTargets?.length ?? 0) > 0;

  return (
    <section
      aria-labelledby={`${selectId}-heading`}
      className="mb-10 rounded-xl border border-border bg-card p-gutter sm:p-6"
    >
      <p className="font-mono text-eyebrow uppercase text-primary">Theme pairing</p>
      <h2 id={`${selectId}-heading`} className="mt-stack text-title font-bold text-foreground">
        Pair this with a coding theme
      </h2>
      <p className="mt-1.5 text-label text-muted-foreground">
        Pick a backup coding or terminal theme. Values from this website design win; the backup fills the rest.
      </p>

      {/* The three parts of the flow, rendered by the same component the landing
          section uses so the capability reads identically in both places (#196). */}
      <ThemePairTriad
        className="mt-flow"
        web={{
          label: 'Web theme',
          title: websiteName,
          description: 'This design. Its values win every conflict.',
          swatches: paletteSwatches(websiteData.tokens.colors?.light),
        }}
        backup={{
          label: 'Backup terminal theme',
          labelFor: selectId,
          description: 'Fills the syntax, ANSI and editor values this design has no opinion about.',
          swatches: paletteSwatches(backupData?.tokens.colors?.dark),
          control: (
            <select
              id={selectId}
              value={backupSlug}
              onChange={e => setBackupSlug(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a backup theme…</option>
              {backupThemes.map(theme => (
                <option key={theme.slug} value={theme.slug}>
                  {theme.name} ({getCollectionLabel(theme.collection ?? 'coding')})
                </option>
              ))}
            </select>
          ),
        }}
        result={{
          label: 'Mapped coding theme',
          title: mapped && backup ? `${websiteName} × ${backup.name}` : 'Select a backup theme',
          description: mapped
            ? `Mapped against the ${mapped.defaultMode} palette.`
            : 'One agent prompt that themes your editor and terminal.',
          control: showAppTarget ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${selectId}-target`} className="text-micro font-medium text-foreground">
                App target
              </label>
              <select
                id={`${selectId}-target`}
                value={appTarget}
                onChange={e => setAppTarget(e.target.value as AppTarget | '')}
                className={selectClass}
              >
                <option value="">Any app</option>
                {backup?.appTargets?.map(target => (
                  <option key={target} value={target}>
                    {APP_TARGET_LABELS[target]}
                  </option>
                ))}
              </select>
            </div>
          ) : undefined,
        }}
      />

      {backupSlug && (
        <p
          className={`text-label ${mapped ? 'sr-only' : 'mt-flow'} ${backupFailed ? 'text-destructive' : 'text-muted-foreground'}`}
          role="status"
        >
          {mapped ? '' : backupFailed ? 'Could not load the backup theme. Pick another one.' : 'Loading backup theme…'}
        </p>
      )}

      {mapped && (
        <>
          <div className="mt-flow">
            <h3 className="text-label font-semibold text-foreground">
              {hasConflicts ? `Conflicts to validate (${mapped.conflicts.length})` : 'No conflicts detected'}
            </h3>
            <p className="mt-1 text-micro text-muted-foreground">
              Checked against the {mapped.defaultMode} palette. The brand-accent check covers the keyword scope only.
            </p>
            {mapped.uncheckedColors.length > 0 && (
              <p className="mt-1 text-micro text-destructive">
                Not analyzed (only H S% L% colors are checked — verify manually): {mapped.uncheckedColors.join(', ')}
              </p>
            )}
            {hasConflicts && (
              <ul className="mt-stack space-y-stack">
                {mapped.conflicts.map(conflict => (
                  <li key={conflict.id} className="rounded-lg border border-border p-3 text-label">
                    <p className="font-mono text-micro text-muted-foreground">{conflict.key}</p>
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
              <label className="mt-stack inline-flex min-h-[44px] items-center gap-2 text-label font-medium">
                <input type="checkbox" checked={validated} onChange={e => setValidated(e.target.checked)} />
                I&rsquo;ve reviewed these choices
              </label>
            )}
          </div>

          <PromptSurface
            className="mt-flow"
            label="Mapped theme prompt"
            meta={
              <p
                id={`${selectId}-copy-status`}
                className={`text-micro ${copyError ? 'text-destructive' : 'text-muted-foreground'}`}
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
            }
            actions={
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
            }
          >
            <pre data-testid="mapped-theme-prompt" className={promptBodyClassName}>
              {prompt}
            </pre>
          </PromptSurface>
        </>
      )}
    </section>
  );
}
