import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Moon, Paintbrush, RotateCcw, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/CopyButton';
import { TokenTable } from '@/components/TokenTable';
import designs from '@/data/designs';
import type { TransformedDesign } from '@/types/design';
import { useDesign } from '@/context/DesignContext';

const AGENT_PROMPT_TEMPLATE = (designUrl: string) => `Fetch the design system at: ${designUrl}

Read the JSON, then follow the steps in agentInstructions.steps to apply this design system to my project:

1. Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)
2. Set --radius from tokens.radius.default
3. Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag
4. Set font-family from tokens.typography.fontFamily
5. Apply component styles from the components field (Tailwind class names for shadcn projects)
6. Ensure focus states match accessibility.focusRing specification
7. Test both light and dark modes

Target framework: Tailwind CSS + shadcn/ui. For other frameworks, map token names to CSS custom properties semantically.`;

function ButtonPreview() {
  return (
    <div className="flex items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}

function InputPreview() {
  return (
    <div className="max-w-md">
      <Input placeholder="Text input..." />
    </div>
  );
}

function BadgePreview() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="accent">Accent</Badge>
    </div>
  );
}

function CardPreview() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description text</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the card content area. It can contain text, images, or other components.
        </p>
      </CardContent>
    </Card>
  );
}

export function DesignDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [design, setDesign] = useState<TransformedDesign | null>(null);
  const [designData, setDesignData] = useState<Record<string, any> | null>(null);
  const [showPreviewDark, setShowPreviewDark] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const { appliedDesign, applyDesign, resetDesign } = useDesign();
  const isApplied = appliedDesign?.slug === slug;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(type);
      setTimeout(() => setIsCopied(null), 2000);
    });
  };

  useEffect(() => {
    if (!slug) return;

    const foundDesign = designs.find((d) => d.slug === slug);
    if (foundDesign) {
      setDesign(foundDesign);
      setDesignData(foundDesign.rawData);
    }
  }, [slug]);

  useEffect(() => {
    if (design) {
      document.title = `${design.name} — sleek-ui`;
    }
  }, [design]);

  if (!design) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Design not found</h2>
          <p className="text-muted-foreground mt-2">The requested design could not be found.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const designUrl = design.jsonUrl;
  const agentPrompt = AGENT_PROMPT_TEMPLATE(designUrl);

  return (
    <div className={cn('min-h-screen bg-background', showPreviewDark && 'dark')}>
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </Link>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{design.name}</h1>
            <p className="text-xl text-muted-foreground">{design.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPreviewDark((prev) => !prev)}
              className="h-10 w-10"
              aria-label="Toggle preview mode"
            >
              {showPreviewDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {isApplied ? (
              <Button
                variant="outline"
                onClick={resetDesign}
                className="gap-2"
                aria-label="Reset design"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            ) : (
              <Button
                onClick={() => design && designData && applyDesign(design.slug, design.name, designData as any)}
                className="gap-2"
                aria-label="Apply this design to the website"
              >
                <Paintbrush className="h-4 w-4" />
                Apply
              </Button>
            )}
          </div>
        </div>

        {/* Agent Prompt — primary action */}
        <div className="mb-10 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Agent Prompt</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Copy and paste this into Claude Code, Cursor, or any AI agent</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleCopy(agentPrompt, 'agentPrompt')}
              className="shrink-0 gap-2"
            >
              {isCopied === 'agentPrompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {isCopied === 'agentPrompt' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-background/80 p-4 text-sm font-mono text-foreground/90 border border-border">
            {agentPrompt}
          </pre>
        </div>

        {/* Design Info */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Design Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {design.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Default Mode</p>
                <p className="mt-2 text-foreground">{design.defaultMode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">JSON URL</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input value={design.jsonUrl} readOnly className="flex-1" />
                  <CopyButton text={design.jsonUrl} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Previews */}
        <section className="mb-12">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Component Previews
          </h2>

          {/* Preview Container */}
          <div className={cn('mt-6 space-y-6', showPreviewDark && 'dark')}>
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Default, Secondary, and Ghost variants</CardDescription>
              </CardHeader>
              <CardContent>
                <ButtonPreview />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Text input field</CardDescription>
              </CardHeader>
              <CardContent>
                <InputPreview />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Default, Secondary, Outline, and Accent variants</CardDescription>
              </CardHeader>
              <CardContent>
                <BadgePreview />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card</CardTitle>
                <CardDescription>Card with title, description, and content</CardDescription>
              </CardHeader>
              <CardContent>
                <CardPreview />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Token Table */}
        <section className="mb-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
              Design Tokens
            </h2>
            <p className="text-sm text-muted-foreground">
              All token values — click any value to copy
            </p>
          </div>

          {designData && designData.tokens ? (
            <div className={cn('mt-4', showPreviewDark && 'dark')}>
              <TokenTable tokens={designData.tokens} />
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">Loading design tokens...</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default DesignDetail;
