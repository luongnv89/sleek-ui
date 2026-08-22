import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';

export function buildAgentPrompt(designUrl: string): string {
  return `Fetch the design system at: ${designUrl}

Read the JSON, then follow the steps in agentInstructions.steps to apply this design system to my project:

1. Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)
2. Set --radius from tokens.radius.default
3. Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag
4. Set font-family from tokens.typography.fontFamily
5. Apply component styles from the components field (Tailwind class names for shadcn projects)
6. Ensure focus states match accessibility.focusRing specification
7. Test both light and dark modes

Target framework: Tailwind CSS + shadcn/ui. For other frameworks, map token names to CSS custom properties semantically.`;
}

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
