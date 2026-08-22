import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { getRandomPrompt } from './App';
import { buildAgentPrompt } from '@/lib/agentPrompt';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

jest.mock('@/data/designs', () => ({
  __esModule: true,
  loadDesigns: jest.fn(),
  loadDesignData: jest.fn(),
}));

import type { TransformedDesign } from '@/types/design';

const testCatalogEntry = {
  slug: 'test-design',
  name: 'Test Design',
  description: 'A test design',
  categories: ['minimal'],
  colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
  defaultMode: 'light' as const,
  jsonUrl: 'https://luongnv.com/sleek-ui/designs/test-design.json',
  thumbnailUrl: '/previews/test.jpg',
  detailUrl: '/designs/test-design',
};

const designsModule = jest.requireMock('@/data/designs') as {
  loadDesigns: jest.Mock;
  loadDesignData: jest.Mock;
};

beforeEach(() => {
  designsModule.loadDesigns.mockResolvedValue([testCatalogEntry]);
  designsModule.loadDesignData.mockResolvedValue(null);
});

describe('HomePage - Social Proof Section (#79)', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('displays GitHub stars count', () => {
    expect(screen.getByText('~126')).toBeInTheDocument();
  });

  it('displays forks count', () => {
    expect(screen.getByText('~11')).toBeInTheDocument();
  });

  it('displays design systems count derived from the catalog (#141)', async () => {
    const label = screen.getByText('Design Systems');
    await waitFor(() => expect(label.previousElementSibling).toHaveTextContent('1'));
  });

  it('displays GitHub Stars label', () => {
    expect(screen.getByText('GitHub Stars')).toBeInTheDocument();
  });

  it('displays Forks label', () => {
    expect(screen.getByText('Forks')).toBeInTheDocument();
  });

  it('displays Design Systems label', () => {
    expect(screen.getByText('Design Systems')).toBeInTheDocument();
  });

  it('displays comparison statement', () => {
    expect(screen.getByText(/vs\. a \$299 UI kit/i)).toBeInTheDocument();
  });

  it('links to GitHub repo', () => {
    const links = screen.getAllByText('Star on GitHub');
    links.forEach(link => {
      expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/luongnv89/sleek-ui');
    });
  });
});

describe('Footer - Shareable Closing Line (#85)', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('displays the bold quotable closing line', () => {
    expect(screen.getByText(/Your app shouldn.*t look like it was built in a weekend/i)).toBeInTheDocument();
  });

  it('displays Star on GitHub CTA in the footer', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    const starLink = footer!.querySelector('a[href="https://github.com/luongnv89/sleek-ui"]');
    expect(starLink).toBeInTheDocument();
    expect(starLink!.textContent).toMatch(/Star on GitHub/);
  });

  it('preserves navigation links', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer!.textContent).toMatch(/Catalog/);
    expect(footer!.textContent).toMatch(/How it works/);
    expect(footer!.textContent).toMatch(/Brand/);
  });

  it('displays the open source tagline with the catalog-derived count (#141)', async () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    await waitFor(() => expect(footer!.textContent).toMatch(/Free.*Open source.*1\+ designs?/));
  });
});

describe('HomePage - Founder Section (#82)', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('displays founder name', () => {
    expect(screen.getByText(/Built solo by Luong/)).toBeInTheDocument();
  });

  it('displays founder personal statement', () => {
    expect(screen.getByText(/tired of AI-built apps/)).toBeInTheDocument();
  });

  it('links to founder GitHub profile', () => {
    const link = screen.getByText('@luongnv89');
    expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/luongnv89');
  });
});

describe('In-page anchor controls under HashRouter (#104)', () => {
  let scrollIntoView: jest.Mock;

  beforeEach(() => {
    scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.location.hash = '#/';
    render(<App />);
  });

  afterEach(() => {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  const expectRouteKeptAndScrolled = () => {
    expect(window.location.hash).toBe('#/');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  };

  it('header desktop How it works scrolls without breaking the route', async () => {
    await userEvent.click(screen.getAllByRole('button', { name: 'How it works' })[0]);
    expectRouteKeptAndScrolled();
  });

  it('footer How it works scrolls without breaking the route', async () => {
    const footer = document.querySelector('footer')!;
    await userEvent.click(
      within(footer).getByRole('button', { name: 'How it works' })
    );
    expectRouteKeptAndScrolled();
  });

  it('mobile menu Browse Designs scrolls to catalog and closes the menu', async () => {
    await userEvent.click(screen.getByRole('button', { name: /Open menu/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Browse Designs' }));
    expectRouteKeptAndScrolled();
    expect(screen.queryByRole('button', { name: /Close menu/i })).not.toBeInTheDocument();
  });

  it('renders no hash-anchor hrefs for in-page sections', () => {
    expect(document.querySelector('a[href="#how-it-works"]')).toBeNull();
    expect(document.querySelector('a[href="#catalog"]')).toBeNull();
  });
});

describe('Catch-all NotFound route (#141)', () => {
  it('renders the NotFound branch for an unmatched path instead of a blank page', async () => {
    window.location.hash = '#/definitely-not-a-route';
    render(<App />);
    expect(await screen.findByText('404')).toBeInTheDocument();
    expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Catalog/i })).toBeInTheDocument();
    window.location.hash = '#/';
  });

  it('still serves known routes when the catch-all exists', async () => {
    window.location.hash = '#/';
    render(<App />);
    expect(await screen.findByText(/Built solo by Luong/)).toBeInTheDocument();
  });
});

describe('Deterministic agent prompt example (#124)', () => {
  it('accepts an injected rng so the picked prompt is assertable', async () => {
    await expect(getRandomPrompt(() => 0)).resolves.toBe(
      buildAgentPrompt('https://luongnv.com/sleek-ui/designs/test-design.json')
    );
  });

  it('renders the prompt example built from the catalog', async () => {
    render(<App />);
    expect(await screen.findByText(/designs\/test-design\.json/)).toBeInTheDocument();
  });

  it('returns a fallback prompt for an empty catalog instead of throwing (#141)', async () => {
    designsModule.loadDesigns.mockResolvedValueOnce([]);
    await expect(getRandomPrompt(() => 0)).resolves.toBe(buildAgentPrompt(''));
  });
});

describe('Route-level code splitting + compression (#136)', () => {
  afterEach(() => {
    window.location.hash = '#/';
  });

  it('shows the Suspense fallback while the detail route resolves on direct visit', async () => {
    let resolveLoad!: (value: TransformedDesign[]) => void;
    designsModule.loadDesigns.mockImplementationOnce(
      () =>
        new Promise<TransformedDesign[]>(resolve => {
          resolveLoad = resolve;
        })
    );

    window.location.hash = '#/designs/test-design';
    render(<App />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(resolveLoad).toBeDefined());
    expect(screen.getByRole('status')).toHaveTextContent(/Loading design/i);

    resolveLoad([testCatalogEntry]);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Test Design' })
    ).toBeInTheDocument();
  });
});

describe('Error/edge-path guards (#123)', () => {
  it('recovers from an empty search via the Clear filters button', async () => {
    render(<App />);
    expect(await screen.findByText('1 / 1 designs')).toBeInTheDocument();
    const search = screen.getByLabelText('Search by name, brand, or style...');
    await userEvent.type(search, 'zzz-no-such-design');
    expect(screen.getByText('No designs match your search.')).toBeInTheDocument();
    expect(screen.getByText('0 / 1 designs')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('1 / 1 designs')).toBeInTheDocument();
    expect(screen.queryByText('No designs match your search.')).not.toBeInTheDocument();
    expect(search).toHaveValue('');
  });

  it('renders and toggles the theme without uncaught errors when localStorage.setItem throws', async () => {
    localStorage.clear();
    localStorage.setItem('sleek-ui:theme', 'light');
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    try {
      render(<App />);
      // mount effects (theme persistence, applied-design restore) must not throw
      expect(screen.getByText(/Built solo by Luong/)).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Switch to (dark|light) theme/ }));
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      await userEvent.click(screen.getByRole('button', { name: /Switch to (dark|light) theme/ }));
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(setItem).toHaveBeenCalled();
    } finally {
      setItem.mockRestore();
    }
  });
});
