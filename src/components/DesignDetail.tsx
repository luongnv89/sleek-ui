import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Moon, Paintbrush, RotateCcw, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { TokenTable } from '@/components/TokenTable';
import { AgentPromptPanel } from '@/components/AgentPromptPanel';
import { PreviewSection } from '@/components/PreviewSection';
import { loadDesignData, loadDesigns } from '@/data/designs';
import type { TransformedDesign, DesignData } from '@/types/design';
import { useDesign } from '@/context/DesignContext';

export function DesignDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [design, setDesign] = useState<TransformedDesign | null>(null);
  const [designData, setDesignData] = useState<DesignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewDark, setShowPreviewDark] = useState(false);
  // Distinguishes "tokens still fetching" from "token data unavailable" (#140)
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [confirmingApply, setConfirmingApply] = useState(false);
  const { appliedDesign, applyDesign, resetDesign } = useDesign();
  const isApplied = appliedDesign?.slug === slug;

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setDesign(null);
    setDesignData(null);
    setTokenStatus('loading');
    setConfirmingApply(false);

    if (!slug) return;

    loadDesignData(slug).then(data => {
      if (!alive) return;
      setDesignData(data);
      setTokenStatus(data ? 'ready' : 'unavailable');
    });
    loadDesigns().then(list => {
      if (!alive) return;
      setDesign(list.find(d => d.slug === slug) ?? null);
      setIsLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    document.title = design
      ? `${design.name} — sleek-ui`
      : 'sleek-ui — Professional design systems for AI agents';
  }, [design]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted-foreground">Loading design…</p>
      </div>
    );
  }

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
              // Applying reskins the whole site — require an explicit confirm (#140)
              <Button
                onClick={() => setConfirmingApply(true)}
                disabled={!designData}
                className="gap-2"
                aria-label="Apply this design to the website"
              >
                <Paintbrush className="h-4 w-4" />
                Apply
              </Button>
            )}
          </div>
        </div>

        {/* Apply confirmation — applying reskins the whole site (#140) */}
        {confirmingApply && design && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm apply design"
            data-testid="apply-confirm-dialog"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
              <h2 className="text-xl font-bold tracking-tight">
                Apply &ldquo;{design.name}&rdquo;?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This restyles the entire site with this design&rsquo;s tokens. You can reset it
                afterwards.
              </p>
              {designData?.tokens?.colors && (
                <div className="mt-4 flex items-center gap-3" aria-hidden="true">
                  <span
                    className="h-10 w-10 rounded-lg border border-border"
                    style={{
                      backgroundColor: `hsl(${designData.tokens.colors.light?.primary ?? '0 0% 50%'})`,
                    }}
                  />
                  <span
                    className="h-10 w-10 rounded-full border border-border"
                    style={{
                      backgroundColor: `hsl(${designData.tokens.colors.light?.background ?? '0 0% 100%'})`,
                    }}
                  />
                </div>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmingApply(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (designData) applyDesign(design, designData);
                    setConfirmingApply(false);
                  }}
                  aria-label="Confirm apply this design to the website"
                >
                  <Paintbrush className="mr-1 h-4 w-4" />
                  Apply design
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Prompt — primary action */}
        <AgentPromptPanel designUrl={design.jsonUrl} />

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
        <PreviewSection previewDark={showPreviewDark} />

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

          {tokenStatus === 'loading' ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">Loading design tokens...</p>
            </div>
          ) : tokenStatus === 'unavailable' || !designData || !designData.tokens ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">Design tokens are unavailable for this design.</p>
            </div>
          ) : (
            <div className={cn('mt-4', showPreviewDark && 'dark')}>
              <TokenTable
                tokens={designData.tokens}
                previewDark={showPreviewDark}
                onPreviewDarkChange={setShowPreviewDark}
              />
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
