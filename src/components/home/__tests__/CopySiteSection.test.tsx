import { render, screen, fireEvent, act } from '@testing-library/react';
import { CopySiteSection } from '../CopySiteSection';

function mockClipboard(impl: () => Promise<void>) {
  const writeText = jest.fn(impl);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

function renderSection() {
  return render(<CopySiteSection />);
}

function typeUrl(value: string) {
  fireEvent.change(screen.getByLabelText('Website URL'), { target: { value } });
}

describe('CopySiteSection (#189)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders a form that accepts the URL of the website to copy', () => {
    renderSection();
    expect(screen.getByRole('form', { name: 'Website-copy prompt generator' })).toBeInTheDocument();
    expect(screen.getByLabelText('Website URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate prompt' })).toBeInTheDocument();
    // The live region must already exist so the first announcement lands.
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('keeps the submit disabled and renders no prompt while the URL is empty', () => {
    renderSection();
    const submit = screen.getByRole('button', { name: 'Generate prompt' });
    expect(submit).toBeDisabled();
    expect(screen.queryByText(/Copy the design of the website at:/)).not.toBeInTheDocument();

    // Whitespace-only input must not generate a prompt either.
    typeUrl('   ');
    expect(submit).toBeDisabled();
  });

  it('produces a copyable gated prompt when the form is submitted', () => {
    renderSection();
    typeUrl('stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    const output = screen.getByText(/Copy the design of the website at:/);
    expect(output.textContent).toContain('https://stripe.com');
    expect(output.textContent).toContain('PHASE 1 — RESEARCH');
    expect(output.textContent).toContain('PHASE 2 — PLANNING');
    expect(output.textContent).toContain('PHASE 3 — IMPLEMENTATION');
    expect(output.textContent).toMatch(/wait for my approval/i);
  });

  it('announces the output in a status region with a keyboard-scrollable prompt', () => {
    renderSection();
    typeUrl('stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    // The polite live region carries only a short announcement — the prompt
    // itself stays outside it so it is not read aloud or re-announced on Copy.
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Prompt generated for https://stripe.com');
    expect(status.textContent).not.toContain('PHASE 1');
    // The overflowing <pre> must be tabbable so keyboard users can scroll it.
    const output = screen.getByRole('region', { name: 'Generated prompt' });
    expect(output).toHaveAttribute('tabindex', '0');
    // Long URLs must wrap instead of scrolling horizontally on small screens.
    expect(output).toHaveClass('break-all');
    expect(output.textContent).toContain('https://stripe.com');
  });

  it('shows a validation error for a malformed URL and generates nothing', () => {
    renderSection();
    typeUrl('foo bar');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/valid website URL/i);
    const input = screen.getByLabelText('Website URL');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'copy-site-url-error');
    expect(screen.queryByText(/Copy the design of the website at:/)).not.toBeInTheDocument();
  });

  it('clears the validation error once a valid URL is submitted', () => {
    renderSection();
    typeUrl('foo bar');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    typeUrl('stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Website URL')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText(/Copy the design of the website at:/)).toBeInTheDocument();
  });

  it('removes the generated prompt when a resubmitted URL is invalid', () => {
    renderSection();
    typeUrl('stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    expect(screen.getByText(/Copy the design of the website at:/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Prompt generated');

    typeUrl('foo bar');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/valid website URL/i);
    expect(screen.queryByText(/Copy the design of the website at:/)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('clears the validation error as soon as the URL is edited', () => {
    renderSection();
    typeUrl('foo bar');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    typeUrl('foo ba');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Website URL')).not.toHaveAttribute('aria-invalid');
  });

  it('surfaces clipboard failures on the Copy button', async () => {
    mockClipboard(() => Promise.reject(new Error('denied')));
    renderSection();
    typeUrl('stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });

    // The accessible name must keep the visible "Copy" label (WCAG 2.5.3).
    expect(
      await screen.findByRole('button', { name: 'Copy failed: denied. Click to try again' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed: denied');
  });

  it('does not resurrect Copied! or drop the failure when a retry fails', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    renderSection();
    typeUrl('https://linear.app');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();

    // A failed retry must clear the copied flag — never show AlertCircle
    // alongside a stale "Copied!" label.
    writeText.mockImplementation(() => Promise.reject(new Error('denied')));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copied!' }));
    });
    expect(
      screen.getByRole('button', { name: 'Copy failed: denied. Click to try again' })
    ).toBeInTheDocument();
  });

  it('keeps the last copy outcome announced after feedback flags auto-clear', async () => {
    jest.useFakeTimers();
    mockClipboard(() => Promise.reject(new Error('denied')));
    renderSection();
    typeUrl('stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed: denied');

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    // The announcement must not revert to "Prompt generated for…".
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed: denied');
    expect(screen.getByRole('status')).not.toHaveTextContent('Prompt generated');
  });

  it('copies the generated prompt to the clipboard with Copied! feedback', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    renderSection();
    typeUrl('https://linear.app');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));

    const copyButton = screen.getByRole('button', { name: 'Copy' });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('https://linear.app'));
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Prompt copied to clipboard');
  });

  it('clears stale Copied! feedback when a new prompt is generated', async () => {
    mockClipboard(() => Promise.resolve());
    renderSection();
    typeUrl('https://linear.app');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();

    typeUrl('https://stripe.com');
    fireEvent.click(screen.getByRole('button', { name: 'Generate prompt' }));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
  });
});
