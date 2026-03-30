import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Eye, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/CopyButton';
import { TokenTable } from '@/components/TokenTable';
import designs from '@/data/designs';
import type { TransformedDesign } from '@/types/design';

// Agent prompt template from PRD section 10.3
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

// Component Previews with standard button variants that exist in the button component
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
  const [jsonOpen, setJsonOpen] = useState(false);

  // Copy handlers
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(type);
      setTimeout(() => setIsCopied(null), 2000);
    });
  };

  useEffect(() => {
    if (!slug) return;

    // Find design by slug
    const foundDesign = designs.find((d) => d.slug === slug);
    if (foundDesign) {
      setDesign(foundDesign);
      setDesignData(foundDesign.rawData);
    }
  }, [slug]);

  // Set page title
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
          </div>
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
                  <CopyButton
                    text={design.jsonUrl}
                    onCopy={(success) => console.log('Copy success:', success)}
                  />
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
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Design Tokens
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Full token table with light and dark mode values
          </p>

          {designData && designData.tokens ? (
            <div className={cn('mt-6', showPreviewDark && 'dark')}>
              <TokenTable tokens={designData.tokens} />
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">Loading design tokens...</p>
            </div>
          )}
        </section>

        {/* Copy Actions */}
        <section className="mb-12">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Copy Actions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Share this design with your AI agent of choice
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {/* Copy URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Copy URL
                </CardTitle>
                <CardDescription>Copies the JSON design URL</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input value={design.jsonUrl} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(design.jsonUrl, 'url')}
                    className="shrink-0"
                  >
                    {isCopied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* View JSON */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  View JSON
                </CardTitle>
                <CardDescription>Opens the raw JSON in a new tab</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => setJsonOpen(true)}
                  className="w-full"
                >
                  Open in New Tab
                </Button>
              </CardContent>
            </Card>

            {/* Copy Agent Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Copy Agent Prompt
                </CardTitle>
                <CardDescription>Copies a ready-to-paste agent instruction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input value={agentPrompt} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(agentPrompt, 'agentPrompt')}
                    className="shrink-0"
                  >
                    {isCopied === 'agentPrompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* JSON Viewer Modal */}
        {jsonOpen && designData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl rounded-lg border bg-background p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Design JSON: {design.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setJsonOpen(false)}>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                  Close
                </Button>
              </div>
              <pre className="max-h-[70vh] overflow-auto rounded-md bg-muted p-4 text-sm font-mono">
                {JSON.stringify(designData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DesignDetail;
