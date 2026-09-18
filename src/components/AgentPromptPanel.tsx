import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PromptSurface, promptBodyProps } from '@/components/ui/PromptSurface';
import { useClipboard } from '@/hooks/useClipboard';
import { buildAgentPrompt } from '@/lib/agentPrompt';
import { APP_TARGET_LABELS } from '@/lib/appTargets';
import { getCollectionLabel } from '@/lib/collections';
import type { AppTarget, Collection, DesignData } from '@/types/design';

export { buildAgentPrompt };

interface AgentPromptPanelProps {
  designUrl: string;
  collection?: Collection;
  appTargets?: AppTarget[];
  designData?: DesignData | null;
}

export function AgentPromptPanel({ designUrl, collection = 'web', appTargets = [], designData = null }: AgentPromptPanelProps) {
  const isAppTheme = collection === 'terminal' || collection === 'coding';
  const [activeTarget, setActiveTarget] = useState<AppTarget | null>(
    isAppTheme && appTargets.length > 0 ? appTargets[0] : null,
  );
  // Reset the selected target when navigating between designs: a stale target
  // from the previous design would otherwise fall back to the generic prompt.
  const appTargetsKey = appTargets.join(',');
  useEffect(() => {
    setActiveTarget(prev =>
      isAppTheme && appTargets.length > 0
        ? (prev && appTargets.includes(prev) ? prev : appTargets[0])
        : null,
    );
  }, [designUrl, collection, appTargetsKey]);
  const selectedTarget = isAppTheme && activeTarget && appTargets.includes(activeTarget)
    ? activeTarget
    : null;
  const agentPrompt = selectedTarget
    ? buildAgentPrompt(designUrl, { collection, appTarget: selectedTarget, designData })
    : buildAgentPrompt(designUrl, { collection, designData });
  const { copied, copy, resetCopy } = useClipboard<'agentPrompt' | null>('agentPrompt', null);
  // Clear stale "Copied!" feedback whenever the prompt content changes.
  useEffect(() => {
    resetCopy();
  }, [agentPrompt, resetCopy]);

  return (
    <PromptSurface
      className="mb-10"
      label="Agent prompt"
      description="Copy and paste this into Claude Code, Cursor, or any AI agent"
      meta={
        isAppTheme && appTargets.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1" role="group" aria-label="Select app target">
            <Badge variant="secondary" className="text-micro">{getCollectionLabel(collection)}</Badge>
            {appTargets.map(target => (
              <button
                key={target}
                type="button"
                onClick={() => setActiveTarget(target)}
                aria-pressed={selectedTarget === target}
                className={
                  selectedTarget === target
                    ? 'inline-flex min-h-[44px] items-center rounded-full bg-primary px-3 py-1 text-micro font-medium text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    : 'inline-flex min-h-[44px] items-center rounded-full border border-border bg-background px-3 py-1 text-micro text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                }
              >
                {APP_TARGET_LABELS[target]}
              </button>
            ))}
          </div>
        ) : undefined
      }
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => copy(agentPrompt)}
          className="min-h-[44px] shrink-0 gap-2"
        >
          {copied === 'agentPrompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === 'agentPrompt' ? 'Copied!' : 'Copy'}
        </Button>
      }
    >
      <pre {...promptBodyProps({ label: 'Agent prompt' })}>{agentPrompt}</pre>
    </PromptSurface>
  );
}
