import { buttonVariants } from '../Button';

describe('Button variants', () => {
  it('uses the contrast-safe runtime token for link text', () => {
    expect(buttonVariants({ variant: 'link' })).toContain('text-primary-text');
    expect(buttonVariants({ variant: 'link' })).not.toMatch(/(?:^|\s)text-primary(?:\s|$)/);
  });
});
