import { render, screen } from '@testing-library/react';
import { PromptSurface, promptBodyClassName } from '../PromptSurface';

describe('PromptSurface (#196)', () => {
  it('renders the label and the prompt body it is given', () => {
    render(
      <PromptSurface label="Agent prompt">
        <pre className={promptBodyClassName}>Fetch the design system at: https://example.com</pre>
      </PromptSurface>,
    );

    expect(screen.getByText('Agent prompt')).toBeInTheDocument();
    expect(screen.getByText(/Fetch the design system at:/)).toBeInTheDocument();
  });

  it('renders the copy affordance passed as actions', () => {
    render(
      <PromptSurface label="Agent prompt" actions={<button type="button">Copy</button>}>
        <pre>prompt</pre>
      </PromptSurface>,
    );

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders the description, meta and footnote slots when supplied', () => {
    render(
      <PromptSurface
        label="Agent prompt"
        description="Paste into Claude, Cursor, or any agent."
        meta={<span>meta-slot</span>}
        footnote="The agent fetches the JSON."
      >
        <pre>prompt</pre>
      </PromptSurface>,
    );

    expect(screen.getByText('Paste into Claude, Cursor, or any agent.')).toBeInTheDocument();
    expect(screen.getByText('meta-slot')).toBeInTheDocument();
    expect(screen.getByText('The agent fetches the JSON.')).toBeInTheDocument();
  });

  it('omits the optional slots entirely when they are not supplied', () => {
    render(
      <PromptSurface label="Agent prompt">
        <pre>prompt</pre>
      </PromptSurface>,
    );

    // Only the label paragraph survives when description/meta/footnote are absent.
    expect(screen.getByTestId('prompt-surface').querySelectorAll('p')).toHaveLength(1);
  });

  it('applies the shared container classes and merges an extra className', () => {
    render(
      <PromptSurface label="Agent prompt" className="mb-10">
        <pre>prompt</pre>
      </PromptSurface>,
    );

    const surface = screen.getByTestId('prompt-surface');
    expect(surface).toHaveClass('rounded-xl', 'border', 'border-border', 'bg-card', 'mb-10');
    expect(screen.getByText('Agent prompt')).toHaveClass('font-mono', 'text-eyebrow', 'uppercase');
  });

  it('exports one prompt-body class so every prompt on the site reads identically', () => {
    expect(promptBodyClassName).toContain('whitespace-pre-wrap');
    expect(promptBodyClassName).toContain('font-mono');
    expect(promptBodyClassName).toContain('max-h-96');
  });
});
