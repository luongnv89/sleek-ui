jest.mock('@/data/designs', () => {
  const designs = [
    {
      slug: 'alpha-design',
      name: 'Alpha Design',
      categories: ['dashboard'],
      colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
      defaultMode: 'light',
      jsonUrl: '/designs/alpha-design.json',
      thumbnailUrl: '/previews/alpha-thumb.svg',
      detailUrl: '/designs/alpha-design',
      description: 'An alpha design system',
    },
    {
      slug: 'beta-design',
      name: 'Beta Design',
      categories: ['landing-page'],
      colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
      defaultMode: 'light',
      jsonUrl: '/designs/beta-design.json',
      thumbnailUrl: '/previews/beta-thumb.svg',
      detailUrl: '/designs/beta-design',
      description: 'A beta design system',
    },
    {
      slug: 'gamma-design',
      name: 'Gamma Design',
      categories: ['dashboard', 'landing-page'],
      colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
      defaultMode: 'light',
      jsonUrl: '/designs/gamma-design.json',
      thumbnailUrl: '/previews/gamma-thumb.svg',
      detailUrl: '/designs/gamma-design',
      description: 'A gamma design system',
    },
  ];
  return { __esModule: true, default: designs };
});

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogSection } from '../CatalogSection';

function renderCatalog() {
  return render(
    <MemoryRouter>
      <CatalogSection />
    </MemoryRouter>
  );
}

function getCounterText(): string {
  const counter = screen.getByText(/\d+ \/ \d+ designs/);
  if (!counter.textContent) throw new Error('missing counter text');
  return counter.textContent;
}

describe('CatalogSection filtering (#137)', () => {
  it('shows every design before any filter is applied', () => {
    renderCatalog();
    expect(getCounterText()).toMatch(/^(\d+) \/ \1 designs$/);
    expect(screen.queryByText(/No designs match your search/)).not.toBeInTheDocument();
  });

  it('narrows the visible cards to matching designs as the user types', () => {
    renderCatalog();
    const total = Number(getCounterText().match(/^(\d+)/)![1]);
    expect(total).toBeGreaterThan(0);

    const input = screen.getByPlaceholderText('Search by name, brand, or style...');
    fireEvent.change(input, { target: { value: 'zzz-no-such-design-zzz' } });
    expect(getCounterText()).toBe(`0 / ${total} designs`);
    expect(screen.getByText(/No designs match your search/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    expect(getCounterText()).toMatch(new RegExp(`^${total} / ${total} designs$`));
  });

  it('keeps the category pills stable across search keystrokes', () => {
    renderCatalog();
    const filterGroup = screen.getByRole('group', { name: 'Filter by category' });
    const pills = filterGroup.querySelectorAll('button');
    expect(pills.length).toBeGreaterThan(1);
    const firstPill = pills[1];
    const pillTextBefore = firstPill.textContent;

    fireEvent.change(screen.getByPlaceholderText('Search by name, brand, or style...'), {
      target: { value: 'a' },
    });

    expect(filterGroup.querySelectorAll('button').length).toBe(pills.length);
    expect(firstPill.textContent).toBe(pillTextBefore);
  });
});
