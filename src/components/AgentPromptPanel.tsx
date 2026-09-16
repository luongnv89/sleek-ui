import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
    <div className="mb-10 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Agent Prompt</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Copy and paste this into Claude Code, Cursor, or any AI agent</p>
          {isAppTheme && appTargets.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Select app target">
              <Badge variant="secondary" className="text-xs">{getCollectionLabel(collection)}</Badge>
              {appTargets.map(target => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setActiveTarget(target)}
                  aria-pressed={selectedTarget === target}
                  className={
                    selectedTarget === target
                      ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      : 'rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  }
                >
                  {APP_TARGET_LABELS[target]}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => copy(agentPrompt)}
          className="shrink-0 gap-2"
        >
          {copied === 'agentPrompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === 'agentPrompt' ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-background/80 p-4 text-sm font-mono text-foreground/90 border border-border">
        {agentPrompt}
      </pre>
    </div>
  );
}
