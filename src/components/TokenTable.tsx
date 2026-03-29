import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { CopyButton } from '@/components/ui/CopyButton';
import { DesignTokens } from '../types/design';

interface TokenTableProps {
  tokens: DesignTokens;
  className?: string;
}

interface TokenRowProps {
  name: string;
  lightValue: string;
  darkValue?: string;
  showDarkMode: boolean;
}

function TokenRow({ name, lightValue, darkValue, showDarkMode }: TokenRowProps) {
  const displayValue = showDarkMode && darkValue ? darkValue : lightValue;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/50 focus-within:bg-muted/50',
        isHovered ? 'bg-muted/50' : ''
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{name}</code>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-24 shrink-0 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: `hsl(${displayValue})` }}
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span className="font-mono text-sm text-foreground">{displayValue}</span>
            <div className="flex items-center gap-2">
              {darkValue && (
                <span className="text-xs text-muted-foreground">
                  {showDarkMode ? 'Dark' : 'Light'}
                </span>
              )}
              <CopyButton text={displayValue} />
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export function TokenTable({ tokens, className }: TokenTableProps) {
  const [showDarkMode, setShowDarkMode] = useState(false);

  const toggleMode = () => {
    setShowDarkMode((prev) => !prev);
  };

  const lightColors = tokens.colors.light;
  const darkColors = tokens.colors.dark;

  const getColorKeys = () => {
    const keys = new Set<string>();
    Object.keys(lightColors).forEach((key) => keys.add(key));
    Object.keys(darkColors).forEach((key) => keys.add(key));
    return Array.from(keys).sort();
  };

  const colorKeys = getColorKeys();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Color Tokens</h3>
        <button
          type="button"
          onClick={toggleMode}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-pressed={showDarkMode}
        >
          {showDarkMode ? (
            <>
              <Moon className="h-4 w-4" aria-hidden="true" />
              View Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" aria-hidden="true" />
              View Light Mode
            </>
          )}
        </button>
      </div>

      {/* Color Tokens Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Token Name</th>
                <th className="px-4 py-3 font-semibold">HSL Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {colorKeys.map((key) => (
                <TokenRow
                  key={key}
                  name={key}
                  lightValue={lightColors[key] || ''}
                  darkValue={darkColors[key]}
                  showDarkMode={showDarkMode}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
