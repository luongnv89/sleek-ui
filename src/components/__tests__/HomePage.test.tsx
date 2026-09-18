jest.mock('@/data/designs', () => {
  const designs = [
    {
      slug: 'test-design',
      name: 'Test Design',
      categories: ['test'],
      colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
      defaultMode: 'light',
      jsonUrl: 'https://luongnv.com/sleek-ui/designs/test-design.json',
      thumbnailUrl: 'https://luongnv.com/sleek-ui/previews/test-design-thumb.svg',
      detailUrl: '/designs/test-design',
      description: 'A test design system',
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
import App from '@/App';
import { HomePage } from '@/components/home/HomePage';

async function waitForCatalogLoaded() {
  // Hero count only appears once the lazy catalog has resolved (#135)
  await screen.findByText(/production-grade design systems/);
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
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
  window.scrollTo = jest.fn();
});

describe('HomePage hero section', () => {
  it('renders the new headline "Give your AI agent good taste"', () => {
    render(<App />);
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent(/Give your AI agent good taste/);
  });

  it('renders the subheading with design count, one URL, zero Figma', async () => {
    render(<App />);
    expect(await screen.findByText(/production-grade design systems/)).toBeInTheDocument();
    expect(screen.getByText(/one URL, zero Figma/)).toBeInTheDocument();
  });

  it('renders the primary CTA as a button labelled with the design count', async () => {
    render(<App />);
    await waitForCatalogLoaded();
    const button = screen.getByRole('button', { name: /Browse.*Design/ });
    expect(button.tagName).toBe('BUTTON');
  });

  it('offers a secondary action to jump to the how-it-works section', () => {
    render(<App />);
    const link = screen.getByRole('button', { name: /See how it works ↓/ });
    expect(link.tagName).toBe('BUTTON');
  });

  it('primary CTA label includes design count from mock and pluralizes correctly (#141)', async () => {
    render(<App />);
    await waitForCatalogLoaded();
    expect(screen.getByText(/Browse 1 Design\b/)).toBeInTheDocument();
  });
});

describe('Capability discoverability on the landing surface (#196)', () => {
  it('names both capabilities in the hero, above the fold (AC3)', () => {
    render(<App />);
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(hero.textContent).toMatch(/Pair a web theme with a matching coding theme and a backup terminal theme/);
    expect(hero.textContent).toMatch(/paste any\s+URL to copy that site/);
  });

  it('offers a one-interaction hero control for each capability (AC3)', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Pair a coding theme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy any site' })).toBeInTheDocument();
  });

  it('reaches each capability section in one interaction from the hero (AC3)', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      const { container } = render(<App />);
      const scrolled = () =>
        scrollIntoView.mock.instances.map(node => (node as HTMLElement).id);

      fireEvent.click(screen.getByRole('button', { name: 'Pair a coding theme' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy any site' }));
      fireEvent.click(screen.getByRole('button', { name: 'See how it works ↓' }));

      expect(scrolled()).toEqual(['theme-pairing', 'copy-site', 'how-it-works']);
      // Each hero control resolves to a section that is actually on the page.
      scrolled().forEach(id => expect(container.querySelector(`section#${id}`)).toBeInTheDocument());
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  });

  it('scrolls the primary CTA to the catalog (AC5 browsing flow)', async () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      render(<App />);
      await waitForCatalogLoaded();
      fireEvent.click(screen.getByRole('button', { name: /Browse.*Design/ }));
      expect((scrollIntoView.mock.instances[0] as HTMLElement).id).toBe('catalog');
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  });

  it('renders the paired-theming section with its three labelled parts (AC1)', () => {
    const { container } = render(<App />);
    expect(container.querySelector('section#theme-pairing')).toBeInTheDocument();
    expect(screen.getByText('Web theme')).toBeInTheDocument();
    expect(screen.getByText('Backup terminal theme')).toBeInTheDocument();
    expect(screen.getByText('Mapped coding theme')).toBeInTheDocument();
  });

  it('renders the copy-a-site section as a named feature with its input/output (AC2)', () => {
    const { container } = render(<App />);
    expect(container.querySelector('section#copy-site')).toBeInTheDocument();
    expect(screen.getByText('Copy a Site')).toBeInTheDocument();
    expect(screen.getByText('One public website URL')).toBeInTheDocument();
    expect(screen.getByText('A three-phase agent prompt')).toBeInTheDocument();
  });

  it('places both capability sections ahead of the design catalog (AC3)', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('section[id]')).map(s => s.id);
    expect(ids).toEqual(expect.arrayContaining(['how-it-works', 'theme-pairing', 'copy-site', 'catalog']));
    expect(ids.indexOf('theme-pairing')).toBeLessThan(ids.indexOf('catalog'));
    expect(ids.indexOf('copy-site')).toBeLessThan(ids.indexOf('catalog'));
  });
});

describe('Scrollable prompt bodies stay keyboard-reachable (#196, WCAG 2.1.1)', () => {
  it('exposes the how-it-works example prompt as a focusable named region', () => {
    render(<App />);
    const region = screen.getByRole('region', { name: 'Example prompt' });
    expect(region.tagName).toBe('CODE');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveClass('max-h-96', 'overflow-auto', 'focus-visible:ring-2');
  });
});

describe('Off-route section links finish on the home route (#196)', () => {
  it('scrolls to the section named in the router state once the sections have mounted', async () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/', state: { scrollTo: 'copy-site' } }]}>
          <HomePage />
        </MemoryRouter>,
      );
      await waitFor(() =>
        expect(scrollIntoView.mock.instances.map(node => (node as HTMLElement).id)).toContain(
          'copy-site',
        ),
      );
      const target = document.getElementById('copy-site');
      expect(target).toHaveAttribute('tabindex', '-1');
      expect(document.activeElement).toBe(target);
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  });
});

describe('Pain/problem section position (issue #83)', () => {
  it('renders the pain/problem section describing what AI-built apps look like', () => {
    render(<App />);
    expect(screen.getByText(/What most AI-built apps look like/)).toBeInTheDocument();
  });

  it('renders pain section items about mismatched styles and vibe coding', () => {
    render(<App />);
    expect(screen.getByText(/Default browser styles or random Tailwind values/)).toBeInTheDocument();
    expect(screen.getByText(/Mismatched buttons, inputs, and cards/)).toBeInTheDocument();
    expect(screen.getByText(/Users trust polished interfaces/)).toBeInTheDocument();
  });

  it('pain section appears before the demo video section in DOM order', () => {
    const { container } = render(<App />);
    const html = container.innerHTML;
    const painIndex = html.indexOf('What most AI-built apps look like');
    const videoIndex = html.indexOf('Watch it transform a real app');
    expect(painIndex).toBeGreaterThan(0);
    expect(videoIndex).toBeGreaterThan(0);
    expect(painIndex).toBeLessThan(videoIndex);
  });
});
