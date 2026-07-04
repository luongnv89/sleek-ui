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
  return { __esModule: true, default: designs };
});

import { render, screen } from '@testing-library/react';
import App from '@/App';

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

describe('Hero section', () => {
  it('renders the new headline "Give your AI agent good taste"', () => {
    render(<App />);
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent(/Give your AI agent good taste/);
  });

  it('renders the subheading with design count, one URL, zero Figma', () => {
    render(<App />);
    expect(screen.getByText(/one URL, zero Figma/)).toBeInTheDocument();
    expect(screen.getByText(/production-grade design systems/)).toBeInTheDocument();
  });

  it('shows a primary CTA button with Browse label styled as solid button', () => {
    render(<App />);
    const button = screen.getByText(/Browse.*Designs/);
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain('bg-[');
  });

  it('renders the secondary action as a text link without border styling', () => {
    render(<App />);
    const link = screen.getByText(/See how it works ↓/);
    expect(link.tagName).toBe('BUTTON');
    expect(link.className).not.toContain('border');
    expect(link.className).toContain('text-muted-foreground');
  });

  it('primary CTA label includes design count from mock', () => {
    render(<App />);
    expect(screen.getByText(/Browse 1 Designs/)).toBeInTheDocument();
  });
});
