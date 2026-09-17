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
  fireEvent.change(screen.getByLabelText('Website URL to copy'), { target: { value } });
}

describe('CopySiteSection (#189)', () => {
  it('renders a form that accepts the URL of the website to copy', () => {
    renderSection();
    expect(screen.getByRole('form', { name: 'Website-copy prompt generator' })).toBeInTheDocument();
    expect(screen.getByLabelText('Website URL to copy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate prompt' })).toBeInTheDocument();
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

    // Screen readers announce the injected panel via the polite live region.
    expect(screen.getByRole('status')).toBeInTheDocument();
    // The overflowing <pre> must be tabbable so keyboard users can scroll it.
    const output = screen.getByRole('region', { name: 'Generated prompt' });
    expect(output).toHaveAttribute('tabindex', '0');
    expect(output.textContent).toContain('https://stripe.com');
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
