import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  window.requestAnimationFrame = callback => {
    callback(0);
    return 1;
  };
  window.cancelAnimationFrame = jest.fn();
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

  it('gives every desktop header control a padded 44px target', () => {
    renderHeader();
    const header = screen.getByRole('banner');
    const nav = header.querySelector('nav')!;
    const controls = nav.querySelectorAll(':scope > a, :scope > button');

    expect(header.querySelector('a[href="/"]')).toHaveClass('min-h-11', 'items-center');
    expect(controls).toHaveLength(5);
    controls.forEach(control => {
      expect(control).toHaveClass('inline-flex', 'min-h-[44px]', 'items-center', 'px-3');
    });
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

  it('gives the mobile menu trigger a 44px touch target', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveClass('h-11', 'w-11');
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

  it('closes the mobile menu before scrolling and focusing the destination', async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    let frameCallback: FrameRequestCallback | undefined;
    const defaultRequestAnimationFrame = window.requestAnimationFrame;
    const defaultCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = jest.fn(callback => {
      order.push('scheduled');
      frameCallback = callback;
      return 2;
    });
    window.cancelAnimationFrame = jest.fn();
    Element.prototype.scrollIntoView = jest.fn(() => order.push('scroll'));
    const target = document.createElement('section');
    target.id = 'theme-pairing';
    target.addEventListener('focus', () => order.push('focus'));
    document.body.appendChild(target);
    try {
      renderHeader();
      openMenu();
      const menu = document.querySelector('div.border-t nav')!;
      const mobilePairing = Array.from(menu.querySelectorAll('button')).find(
        button => button.textContent === 'Theme pairing',
      )!;
      mobilePairing.focus();

      await user.keyboard('{Enter}');

      expect(screen.queryByRole('button', { name: /Close menu/i })).toBeNull();
      expect(order).toEqual(['scheduled']);
      expect(target).not.toHaveAttribute('tabindex');
      expect(document.activeElement).not.toBe(target);

      act(() => frameCallback?.(0));

      expect(order).toEqual(['scheduled', 'scroll', 'focus']);
      expect(target).toHaveAttribute('tabindex', '-1');
      expect(document.activeElement).toBe(target);
    } finally {
      window.requestAnimationFrame = defaultRequestAnimationFrame;
      window.cancelAnimationFrame = defaultCancelAnimationFrame;
      target.remove();
    }
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
