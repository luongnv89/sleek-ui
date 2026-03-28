import * as React from 'react'

import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'accent'
}

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground border-input hover:bg-accent hover:text-accent-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const badgeCustomVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        muted: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export { badgeVariants, badgeCustomVariants }

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function DesignCategoryBadge({ category, className }: { category: string; className?: string }) {
  // Generate a consistent color for each category
  const categoryColors: Record<string, string> = {
    dark: badgeCustomVariants({ variant: 'secondary' }),
    light: badgeCustomVariants({ variant: 'primary' }),
    warm: badgeCustomVariants({ variant: 'accent' }),
    bold: badgeCustomVariants({ variant: 'destructive' }),
    minimal: badgeCustomVariants({ variant: 'muted' }),
    corporate: badgeCustomVariants({ variant: 'primary' }),
    playful: badgeCustomVariants({ variant: 'destructive' }),
  }

  const colorClass = categoryColors[category.toLowerCase()] || badgeCustomVariants({ variant: 'outline' })

  return (
    <Badge className={cn(colorClass, className)}>{category}</Badge>
  )
}
