import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Paintbrush, RotateCcw, Undo2 } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { Button } from '@/components/ui/Button';

export function AppliedDesignBanner() {
  const { appliedDesign, resetDesign, canUndo, undoReset } = useDesign();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (appliedDesign) setDismissed(false);
  }, [appliedDesign]);

  // After a reset, keep a bar around so the destructive action can be undone (#140)
  if (!appliedDesign) {
    if (!canUndo || dismissed) return null;
    return (
      <div
        role="status"
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-muted px-4 py-2 text-foreground shadow-lg border-t border-border"
      >
        <span className="text-sm text-muted-foreground">Design removed.</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undoReset}
            className="shrink-0 gap-1.5"
            aria-label="Undo design removal"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (dismissed) return null;

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
      <div className="flex items-center shrink-0">
        {/* X dismisses the banner only — the applied design is untouched (#140) */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Dismiss banner"
          onClick={() => setDismissed(true)}
          className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetDesign}
          className="gap-1.5 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
