import { badgeVariants } from '../Badge';

describe('Badge visual states', () => {
  it.each(['default', 'secondary', 'outline', 'accent'] as const)(
    'does not add an interactive hover state to the static %s badge',
    variant => {
      expect(badgeVariants({ variant })).not.toContain('hover:');
    },
  );
});
