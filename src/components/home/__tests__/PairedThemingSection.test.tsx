jest.mock('@/data/designs', () => ({
  __esModule: true,
  loadDesigns: jest.fn(),
  loadDesignData: jest.fn(async () => null),
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PairedThemingSection } from '../PairedThemingSection';

const designsModule = jest.requireMock('@/data/designs') as { loadDesigns: jest.Mock };

const webDesign = {
  slug: 'apple',
  name: 'Apple',
  categories: ['minimal'],
  colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
  defaultMode: 'light' as const,
  jsonUrl: 'https://luongnv.com/sleek-ui/designs/apple.json',
  thumbnailUrl: '/previews/apple-thumb.svg',
  detailUrl: '/designs/apple',
  description: 'An apple design system',
};

const terminalDesign = {
  ...webDesign,
  slug: 'aura',
  name: 'Aura',
  collection: 'terminal' as const,
  categories: ['terminal'],
  detailUrl: '/designs/aura',
};

function renderSection() {
  return render(
    <MemoryRouter>
      <PairedThemingSection />
    </MemoryRouter>,
  );
}

describe('PairedThemingSection (#196)', () => {
  beforeEach(() => {
    designsModule.loadDesigns.mockResolvedValue([webDesign, terminalDesign]);
  });

  it('exposes the capability as a named landing section with a stable scroll id', async () => {
    const { container } = renderSection();
    const section = container.querySelector('section#theme-pairing');
    expect(section).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'One web theme, one terminal theme, one coding theme',
    );
    // The section is named by its own heading, not by a generic landmark label.
    expect(section).toHaveAttribute('aria-labelledby', 'theme-pairing-heading');
    expect(screen.getByText('Theme pairing')).toBeInTheDocument();
  });

  it('presents the three parts of the flow as one labelled unit (AC1)', async () => {
    renderSection();
    await screen.findByText('Apple');

    expect(screen.getByText('Web theme')).toBeInTheDocument();
    expect(screen.getByText('Backup terminal theme')).toBeInTheDocument();
    expect(screen.getByText('Mapped coding theme')).toBeInTheDocument();
    expect(screen.getByTestId('theme-pair-triad')).toBeInTheDocument();
  });

  it('names a real catalog design in each of the two input parts', async () => {
    renderSection();
    expect(await screen.findByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Aura')).toBeInTheDocument();
  });

  it('deep-links the CTA to the design detail page where pairing happens (AC3)', async () => {
    renderSection();
    const cta = await screen.findByRole('link', {
      name: 'Pair Apple with a coding theme',
    });
    expect(cta).toHaveAttribute('href', '/designs/apple');
  });

  it('falls back to placeholders and a catalog scroll when the catalog is empty', async () => {
    designsModule.loadDesigns.mockResolvedValue([]);
    renderSection();

    expect(await screen.findByText('Any of the web designs')).toBeInTheDocument();
    expect(screen.getByText('Any terminal or coding theme')).toBeInTheDocument();
    // Never a link to /designs/undefined — the fallback scrolls to the catalog.
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      const fallback = screen.getByRole('button', { name: 'Browse web themes to pair' });
      const catalog = document.createElement('div');
      catalog.id = 'catalog';
      document.body.appendChild(catalog);
      fallback.click();
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      catalog.remove();
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  });
});
