import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { ScrollToTop } from '../ScrollToTop';

/**
 * jsdom does not implement window.scrollTo, so we stub it and assert the
 * component calls it with the instant-jump options on mount and on every
 * pathname change (issue #77).
 */
function Harness() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <ScrollToTop />
      <nav>
        <Link to="/detail">Go to detail</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/detail" element={<h1>Detail</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scrolls to top on initial render', () => {
    render(<Harness />);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });

  it('scrolls to top again when the route path changes', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Go to detail' }));

    // Route changed -> a second scroll-to-top fires.
    expect(screen.getByRole('heading', { name: 'Detail' })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });
});
