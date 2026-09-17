import { render, screen, fireEvent } from '@testing-library/react';
import { AgentPromptPanel } from '../AgentPromptPanel';

const PI_URL = 'https://luongnv.com/sleek-ui/designs/terminal-pi-dracula.json';
const GHOSTTY_URL = 'https://luongnv.com/sleek-ui/designs/terminal-ghostty-dracula.json';

describe('AgentPromptPanel target sync (#181)', () => {
  it('resets a stale target when navigating to a design that lacks it', () => {
    const { rerender } = render(
      <AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={['pi', 'ghostty']} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ghostty' }));
    expect(screen.getByRole('button', { name: 'Ghostty' })).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <AgentPromptPanel designUrl={GHOSTTY_URL} collection="terminal" appTargets={['pi']} />
    );
    expect(screen.getByRole('button', { name: 'Pi' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Fetch the app theme at:/)).toBeInTheDocument();
  });

  it('emits an app-theme prompt — not the web prompt — when an app theme has no targets', () => {
    render(
      <AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={[]} />
    );
    const prompt = screen.getByText(/Fetch the app theme at:/);
    expect(prompt).toBeInTheDocument();
    expect(prompt.textContent).not.toMatch(/Fetch the design system at:/);
  });

  it('keeps the legacy web prompt byte-compatible for web designs', () => {
    render(<AgentPromptPanel designUrl={PI_URL} collection="web" />);
    expect(screen.getByText(/Fetch the design system at:/)).toBeInTheDocument();
  });
});
