import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge knows nothing about our own theme keys, so it files every
 * unknown `text-*` class under `text-color` — where `text-label` would
 * annihilate `text-primary-foreground` and leave an invisible label behind.
 * Declaring the keys literally outranks the colour validator and puts them in
 * `font-size`, where they belong.
 *
 * IMPORTANT: this list must stay in sync with the `--text-*` block in
 * `src/index.css`. A new scale step there needs its name here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'eyebrow',
            'micro',
            'label',
            'body',
            'lede',
            'title',
            'headline',
            'display',
            'hero',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
