import { Link } from 'react-router-dom';
import { X, Paintbrush } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

export function AppliedDesignBanner() {
  const { appliedDesign, resetDesign } = useTheme();

  if (!appliedDesign) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-primary px-4 py-2 text-primary-foreground shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium min-w-0">
        <Paintbrush className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Design applied:{' '}
          <Link
            to={`/designs/${appliedDesign.slug}`}
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {appliedDesign.name}
          </Link>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={resetDesign}
        className="shrink-0 gap-1.5 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
      >
        <X className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
