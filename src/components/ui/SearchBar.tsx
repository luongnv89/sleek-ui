import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchBarProps } from '@/types/components';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  inputClassName,
  clearButtonClassName,
}: SearchBarProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const hasValue = value && value.length > 0;

  return (
    <div className={cn('relative flex w-full items-center', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          inputClassName
        )}
        aria-label={placeholder}
      />
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            clearButtonClassName
          )}
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
