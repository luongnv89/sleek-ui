import { render, screen } from '@testing-library/react';
import { ThemePairTriad } from '../ThemePairTriad';

describe('ThemePairTriad (#196)', () => {
  it('renders all three labelled parts of the pairing flow from props', () => {
    render(
      <ThemePairTriad
        web={{ label: 'Web theme', title: 'Apple' }}
        backup={{ label: 'Backup terminal theme', title: 'Aura' }}
        result={{ label: 'Mapped coding theme', title: 'Apple × Aura' }}
      />,
    );

    expect(screen.getByText('Web theme')).toBeInTheDocument();
    expect(screen.getByText('Backup terminal theme')).toBeInTheDocument();
    expect(screen.getByText('Mapped coding theme')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Aura')).toBeInTheDocument();
    expect(screen.getByText('Apple × Aura')).toBeInTheDocument();
  });

  it('renders the + and = connectors as decorative, so the flow reads as one unit', () => {
    render(
      <ThemePairTriad
        web={{ label: 'Web theme' }}
        backup={{ label: 'Backup terminal theme' }}
        result={{ label: 'Mapped coding theme' }}
      />,
    );

    const connectors = Array.from(
      screen.getByTestId('theme-pair-triad').querySelectorAll('span[aria-hidden="true"]'),
    );
    expect(connectors.map(node => node.textContent)).toEqual(['+', '=']);
  });

  it('omits the title, description and swatch row when the part does not supply them', () => {
    render(
      <ThemePairTriad
        web={{ label: 'Web theme', swatches: [] }}
        backup={{ label: 'Backup terminal theme' }}
        result={{ label: 'Mapped coding theme' }}
      />,
    );

    const triad = screen.getByTestId('theme-pair-triad');
    // Only the two connectors are aria-hidden — an empty swatch array adds none.
    expect(triad.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(triad.querySelectorAll('p')).toHaveLength(3);
  });

  it('renders a swatch per supplied colour and a description when present', () => {
    render(
      <ThemePairTriad
        web={{
          label: 'Web theme',
          description: 'Its values win.',
          swatches: ['hsl(245 90% 73%)', 'hsl(0 0% 100%)'],
        }}
        backup={{ label: 'Backup terminal theme' }}
        result={{ label: 'Mapped coding theme' }}
      />,
    );

    expect(screen.getByText('Its values win.')).toBeInTheDocument();
    const swatches = screen
      .getByTestId('theme-pair-triad')
      .querySelectorAll('div[aria-hidden="true"] > span');
    expect(swatches).toHaveLength(2);
    expect(swatches[0]).toHaveStyle({ backgroundColor: 'hsl(245 90% 73%)' });
  });

  it('binds the role label to a control when labelFor is given, so the select is labelled in-product', () => {
    render(
      <ThemePairTriad
        web={{ label: 'Web theme' }}
        backup={{
          label: 'Backup terminal theme',
          labelFor: 'backup-select',
          control: (
            <select id="backup-select">
              <option value="">Select…</option>
            </select>
          ),
        }}
        result={{ label: 'Mapped coding theme' }}
      />,
    );

    expect(screen.getByLabelText('Backup terminal theme').tagName).toBe('SELECT');
  });

  it('wraps a long mapped-theme title instead of clipping the result the visitor came for', () => {
    render(
      <ThemePairTriad
        web={{ label: 'Web theme' }}
        backup={{ label: 'Backup terminal theme' }}
        result={{ label: 'Mapped coding theme', title: 'Vercel Geist × Tokyo Night Storm' }}
      />,
    );

    const title = screen.getByText('Vercel Geist × Tokyo Night Storm');
    expect(title).toHaveClass('break-words');
    expect(title).not.toHaveClass('truncate');
  });

  it('marks the result part with the primary accent and merges an extra className', () => {
    render(
      <ThemePairTriad
        className="mt-flow"
        web={{ label: 'Web theme' }}
        backup={{ label: 'Backup terminal theme' }}
        result={{ label: 'Mapped coding theme' }}
      />,
    );

    expect(screen.getByTestId('theme-pair-triad')).toHaveClass('mt-flow');
    expect(screen.getByText('Mapped coding theme')).toHaveClass('text-eyebrow', 'text-primary');
    expect(screen.getByText('Web theme')).toHaveClass('text-eyebrow', 'text-muted-foreground');
  });
});
