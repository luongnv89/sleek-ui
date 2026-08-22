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

describe('HomePage hero section', () => {
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

  it('renders the primary CTA as a button labelled with the design count', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Browse.*Designs/ });
    expect(button.tagName).toBe('BUTTON');
  });

  it('offers a secondary action to jump to the how-it-works section', () => {
    render(<App />);
    const link = screen.getByRole('button', { name: /See how it works ↓/ });
    expect(link.tagName).toBe('BUTTON');
  });

  it('primary CTA label includes design count from mock', () => {
    render(<App />);
    expect(screen.getByText(/Browse 1 Designs/)).toBeInTheDocument();
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
