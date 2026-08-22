import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { buildAgentPrompt } from '@/lib/agentPrompt';

export { buildAgentPrompt };

interface AgentPromptPanelProps {
  designUrl: string;
}

export function AgentPromptPanel({ designUrl }: AgentPromptPanelProps) {
  const agentPrompt = buildAgentPrompt(designUrl);
  const { copied, copy } = useClipboard<'agentPrompt' | null>('agentPrompt', null);

  return (
    <div className="mb-10 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Agent Prompt</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Copy and paste this into Claude Code, Cursor, or any AI agent</p>
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

export default AgentPromptPanel;
