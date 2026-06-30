import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets the window scroll position to the top whenever the route path changes.
 *
 * Mounted once inside the router (as a sibling of <Routes>). React Router does
 * not restore/reset scroll on navigation by default, so opening a design's
 * detail page would otherwise inherit the previous page's scroll offset and the
 * user would land mid-page (issue #77).
 *
 * Notes:
 * - `behavior: 'instant'` forces an immediate jump. The global
 *   `html { scroll-behavior: smooth }` rule (index.css) would otherwise animate
 *   a visible upward scroll on every navigation.
 * - `useLayoutEffect` runs before paint, avoiding a one-frame flash at the old
 *   scroll position.
 * - Keyed on `pathname` only, so in-page hash links (#how-it-works) and query
 *   changes are left untouched.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
