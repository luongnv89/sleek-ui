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
  return {
    __esModule: true,
    loadDesigns: jest.fn(async () => designs),
    loadDesignData: jest.fn(async () => null),
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogSection } from '../CatalogSection';

function renderCatalog() {
  return render(
    <MemoryRouter>
      <CatalogSection />
    </MemoryRouter>
  );
}

async function getCounterText(): Promise<string> {
  const counter = await screen.findByText(/\d+ \/ \d+ designs/);
  if (!counter.textContent) throw new Error('missing counter text');
  return counter.textContent;
}

async function waitForCatalog(): Promise<number> {
  // The counter renders "0 / 0" while loading — wait until the lazy catalog resolves
  await screen.findByRole('link', { name: /Alpha Design/ });
  const text = await getCounterText();
  return Number(text.match(/^(\d+)/)![1]);
}

describe('CatalogSection filtering (#137)', () => {
  it('shows every design before any filter is applied', async () => {
    renderCatalog();
    const total = await waitForCatalog();
    expect(total).toBeGreaterThan(0);
    expect(getCounterText()).resolves.toBe(`${total} / ${total} designs`);
    expect(screen.queryByText(/No designs match your search/)).not.toBeInTheDocument();
  });

  it('shows a loading placeholder while the catalog is fetched lazily (#135)', async () => {
    let resolveLoad!: (value: unknown) => void;
    const { loadDesigns } = jest.requireMock('@/data/designs') as {
      loadDesigns: jest.Mock;
    };
    loadDesigns.mockImplementationOnce(
      () => new Promise(resolve => { resolveLoad = resolve; })
    );
    renderCatalog();
    expect(screen.getByRole('status')).toHaveTextContent('Loading designs…');
    resolveLoad([]);
    expect(await screen.findByText(/\/ \d+ designs/)).toBeInTheDocument();
  });

  it('narrows the visible cards to matching designs as the user types', async () => {
    renderCatalog();
    const total = await waitForCatalog();

    const input = screen.getByPlaceholderText('Search by name, brand, or style...');
    fireEvent.change(input, { target: { value: 'zzz-no-such-design-zzz' } });
    expect(getCounterText()).resolves.toBe(`0 / ${total} designs`);
    expect(await screen.findByText(/No designs match your search/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    await waitFor(() =>
      expect(screen.getByText(/\d+ \/ \d+ designs/).textContent).toBe(
        `${total} / ${total} designs`
      )
    );
  });

  it('keeps the category pills stable across search keystrokes', async () => {
    renderCatalog();
    await waitForCatalog();
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
