jest.mock('@/data/designs', () => ({
  __esModule: true,
  loadDesigns: jest.fn(async () => []),
  loadDesignData: jest.fn(async () => null),
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { Layout } from '../Layout';

function renderLayout() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>outlet-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

describe('Layout (#120)', () => {
  it('renders the header around routed outlet content', () => {
    renderLayout();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('outlet-content')).toBeInTheDocument();
  });

  it('renders the footer quote and navigation links', () => {
    renderLayout();
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toMatch(/Your app shouldn.*t look like it was built in a weekend/);
    expect(footer.textContent).toMatch(/Catalog/);
    expect(footer.textContent).toMatch(/How it works/);
    expect(screen.getAllByRole('link', { name: /Star on GitHub/i })[0]).toHaveAttribute(
      'href',
      'https://github.com/luongnv89/sleek-ui',
    );
  });

  it('marks the static Brand page link as external so the SPA route survives (#141)', () => {
    renderLayout();
    const footer = screen.getByRole('contentinfo');
    const brand = footer.querySelector('a[href="/sleek-ui/logo/brand-showcase.html"]');
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute('target', '_blank');
    expect(brand).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('exposes the How it works scroll control as a button', () => {
    Element.prototype.scrollIntoView = jest.fn();
    try {
      renderLayout();
      const footer = screen.getByRole('contentinfo');
      const buttons = Array.from(footer.querySelectorAll('button'));
      expect(buttons.some((b) => b.textContent === 'How it works')).toBe(true);
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  });
});
