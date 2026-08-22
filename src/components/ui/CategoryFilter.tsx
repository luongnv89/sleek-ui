import { cn } from '@/lib/utils';

export interface CategoryFilterProps {
  categories: { id: string; label: string; count: number }[];
  selected: string | null;
  onChange: (id: string | null) => void;
  className?: string;
  pillClassName?: string;
  badgeClassName?: string;
}

export const CategoryFilter = ({
  categories,
  selected,
  onChange,
  className,
  pillClassName,
  badgeClassName,
}: CategoryFilterProps) => {
  const handleCategoryClick = (id: string | null) => {
    onChange(id);
  };

  const isAllSelected = selected === null || selected === '';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="tablist" aria-label="Filter by category">
      <button
        type="button"
        role="tab"
        aria-selected={isAllSelected}
        onClick={() => handleCategoryClick(null)}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isAllSelected
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          pillClassName
        )}
      >
        All
        <span className={cn('ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs', badgeClassName)}>
          {categories.reduce((acc, cat) => acc + cat.count, 0)}
        </span>
      </button>

      {categories.map((category) => {
        const isSelected = selected === category.id;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => handleCategoryClick(isSelected ? null : category.id)}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              pillClassName
            )}
          >
            {category.label}
            <span className={cn('ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs', badgeClassName)}>
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

CategoryFilter.displayName = 'CategoryFilter';
