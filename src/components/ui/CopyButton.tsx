import { useState, useCallback } from 'react';
import { Check, Copy, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CopyButtonProps } from '@/types/components';

export const CopyButton = ({
  text,
  onCopy,
  className,
  iconClassName,
  copyTimeout = 2000,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) {
      setError('Cannot copy empty text');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      onCopy?.(true);

      setTimeout(() => {
        setCopied(false);
      }, copyTimeout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy text');
      setCopied(false);
      onCopy?.(false);
    }
  }, [text, copyTimeout, onCopy]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  };

  const getIcon = () => {
    if (error) return <AlertCircle className={cn('h-4 w-4 text-red-500', iconClassName)} />;
    if (copied) return <Check className={cn('h-4 w-4 text-green-500', iconClassName)} />;
    return <Copy className={cn('h-4 w-4', iconClassName)} />;
  };

  const getAriaLabel = () => {
    if (error) return `Error: ${error}. Click to try again`;
    if (copied) return 'Text copied to clipboard';
    return 'Copy to clipboard';
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative inline-flex items-center justify-center rounded-md border border-input bg-transparent px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      aria-label={getAriaLabel()}
      title={error ? error : copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {getIcon()}

      {/* Tooltip for desktop */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-50">
        {error ? error : copied ? 'Copied!' : 'Copy to clipboard'}
      </span>
    </button>
  );
};

CopyButton.displayName = 'CopyButton';

export default CopyButton;
