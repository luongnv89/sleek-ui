import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useClipboard } from '@/hooks/useClipboard';
import { buildAgentPrompt } from '@/lib/agentPrompt';
import { APP_TARGET_LABELS } from '@/lib/appTargets';
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
  const selectedTarget = isAppTheme && activeTarget && appTargets.includes(activeTarget)
    ? activeTarget
    : null;
  const agentPrompt = selectedTarget
    ? buildAgentPrompt(designUrl, { collection, appTarget: selectedTarget, designData })
    : buildAgentPrompt(designUrl);
  const { copied, copy } = useClipboard<'agentPrompt' | null>('agentPrompt', null);

  return (
    <div className="mb-10 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Agent Prompt</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Copy and paste this into Claude Code, Cursor, or any AI agent</p>
          {isAppTheme && appTargets.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Select app target">
              <Badge variant="secondary" className="text-xs">{collection}</Badge>
              {appTargets.map(target => (
                <button
                  key={target}
                  onClick={() => setActiveTarget(target)}
                  aria-pressed={selectedTarget === target}
                  className={
                    selectedTarget === target
                      ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                      : 'rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground'
                  }
                >
                  {APP_TARGET_LABELS[target]}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => copy(agentPrompt)}
          className="shrink-0 gap-2"
        >
          {copied === 'agentPrompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === 'agentPrompt' ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap rounded-lg bg-background/80 p-4 text-sm font-mono text-foreground/90 border border-border">
        {agentPrompt}
      </pre>
    </div>
  );
}
