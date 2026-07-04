import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from './App';

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

jest.mock('@/data/designs', () => [
  {
    slug: 'test-design',
    name: 'Test Design',
    description: 'A test design',
    categories: ['minimal'],
    jsonUrl: 'https://luongnv.com/sleek-ui/designs/test-design.json',
    previewUrl: '/previews/test.jpg',
  },
]);

describe('HomePage - Social Proof Section (#79)', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('displays GitHub stars count', () => {
    expect(screen.getByText('126')).toBeInTheDocument();
  });

  it('displays forks count', () => {
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('displays design systems count', () => {
    expect(screen.getByText('60+')).toBeInTheDocument();
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
    const link = screen.getByText('Star on GitHub');
    expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/luongnv89/sleek-ui');
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
