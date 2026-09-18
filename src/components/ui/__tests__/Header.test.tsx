import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { Header } from '../Header';

function renderHeader() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: /Open menu/i }));
}

function firstMenuLink() {
  return document.querySelector<HTMLAnchorElement>('div.border-t nav a[href="/"]')!;
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
});

describe('Header capability navigation (#196)', () => {
  afterEach(() => {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  it('exposes both capability sections in the desktop nav as scroll controls', () => {
    renderHeader();
    const nav = screen.getByRole('banner').querySelector('nav')!;
    const labels = Array.from(nav.querySelectorAll('button')).map(b => b.textContent);
    expect(labels).toEqual(['Theme pairing', 'Copy a site', 'How it works']);
  });

  it('scrolls to the theme-pairing section rather than navigating to a hash href', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const target = document.createElement('div');
    target.id = 'theme-pairing';
    document.body.appendChild(target);
    try {
      renderHeader();
      fireEvent.click(screen.getByRole('button', { name: 'Theme pairing' }));
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      // HashRouter would hijack an href="#…" — there must be none (#104/#147).
      expect(document.querySelectorAll('a[href^="#"]')).toHaveLength(0);
    } finally {
      target.remove();
    }
  });

  it('repeats both capability sections in the mobile menu and closes it on use', () => {
    Element.prototype.scrollIntoView = jest.fn();
    renderHeader();
    openMenu();
    const menu = document.querySelector('div.border-t nav')!;
    const labels = Array.from(menu.querySelectorAll('button')).map(b => b.textContent);
    expect(labels).toEqual(['Theme pairing', 'Copy a site', 'How it works', 'Browse Designs']);

    // Scoped to the menu: "Copy a site" is deliberately in both navs.
    const mobileCopySite = Array.from(menu.querySelectorAll('button')).find(
      b => b.textContent === 'Copy a site',
    )!;
    fireEvent.click(mobileCopySite);
    expect(screen.queryByRole('button', { name: /Close menu/i })).toBeNull();
  });
});

describe('Header section links off the home route (#196)', () => {
  afterEach(() => {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  it('navigates to the home route instead of scrolling a section id that is not there', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(
      <MemoryRouter initialEntries={['/designs/alpha-design']}>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<div>home-route</div>} />
            <Route path="/designs/:slug" element={<Header />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Theme pairing' }));

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByText('home-route')).toBeInTheDocument();
  });
});

describe('Header mobile menu (#139)', () => {
  it('closes on Escape and moves focus back to the toggle button', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: /Open menu/i });
    openMenu();
    expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('button', { name: /Close menu/i })).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('moves focus into the menu when opened', () => {
    renderHeader();
    openMenu();
    expect(document.activeElement).toBe(firstMenuLink());
  });

  it('wraps Tab from the last menu item back to the first', () => {
    renderHeader();
    openMenu();
    const browse = screen.getByRole('button', { name: 'Browse Designs' });
    browse.focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(firstMenuLink());
  });
});
