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
import designs from '@/data/designs';
import type { TransformedDesign, DesignData } from '@/types/design';
import { useDesign } from '@/context/DesignContext';

export function DesignDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [design, setDesign] = useState<TransformedDesign | null>(null);
  const [designData, setDesignData] = useState<DesignData | null>(null);
  const [showPreviewDark, setShowPreviewDark] = useState(false);
  const { appliedDesign, applyDesign, resetDesign } = useDesign();
  const isApplied = appliedDesign?.slug === slug;

  useEffect(() => {
    setDesign(null);
    setDesignData(null);

    if (!slug) return;

    const foundDesign = designs.find((d) => d.slug === slug);
    if (foundDesign) {
      setDesign(foundDesign);
      setDesignData(foundDesign.rawData);
    }
  }, [slug]);

  useEffect(() => {
    document.title = design
      ? `${design.name} — sleek-ui`
      : 'sleek-ui — Professional design systems for AI agents';
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
                onClick={() => applyDesign(design)}
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

          {designData && designData.tokens ? (
            <div className={cn('mt-4', showPreviewDark && 'dark')}>
              <TokenTable
                tokens={designData.tokens}
                previewDark={showPreviewDark}
                onPreviewDarkChange={setShowPreviewDark}
              />
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
