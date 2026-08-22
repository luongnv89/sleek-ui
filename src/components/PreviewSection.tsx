import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

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

interface PreviewSectionProps {
  previewDark: boolean;
}

export function PreviewSection({ previewDark }: PreviewSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Component Previews
      </h2>

      <div className={cn('mt-6 space-y-6', previewDark && 'dark')}>
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
  );
}
