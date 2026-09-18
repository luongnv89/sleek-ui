import { act, fireEvent, render, screen } from '@testing-library/react';
import apple from '../../data/designs/apple.json';
import aura from '../../data/designs/aura.json';
import { CodingThemeMappingPanel } from '../CodingThemeMappingPanel';
import type { DesignData, TransformedDesign } from '@/types/design';

const auraTheme: TransformedDesign = {
  slug: 'aura',
  name: 'aura',
  categories: ['terminal'],
  collection: 'terminal',
  appTargets: ['pi', 'vscode'],
  colors: { primary: '', secondary: '' },
  defaultMode: 'dark',
  jsonUrl: 'https://luongnv.com/sleek-ui/designs/aura.json',
  thumbnailUrl: '',
  detailUrl: '',
  description: '',
};

const loadBackup = jest.fn(() => Promise.resolve(aura as unknown as DesignData));

const renderPanel = () =>
  render(
    <CodingThemeMappingPanel
      websiteUrl="https://luongnv.com/sleek-ui/designs/apple.json"
      websiteName="apple"
      websiteData={apple as unknown as DesignData}
      backupThemes={[auraTheme]}
      loadBackup={loadBackup}
    />,
  );

describe('CodingThemeMappingPanel (#187)', () => {
  it('renders nothing without website data or backup themes', () => {
    const { container } = render(
      <CodingThemeMappingPanel websiteUrl="u" websiteName="n" websiteData={null} backupThemes={[auraTheme]} loadBackup={loadBackup} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('selects a backup theme, requires validation of conflicts, and builds the mapped prompt', async () => {
    renderPanel();
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Backup terminal theme'), { target: { value: 'aura' } });
    });
    expect(loadBackup).toHaveBeenCalledWith('aura');
    expect(screen.getByText(/Conflicts to validate/)).toBeInTheDocument();
    // The live region stays mounted once a backup is selected; only its text changes.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    const copyButton = screen.getByRole('button', { name: /Copy/ });
    expect(copyButton).toBeDisabled();
    expect(copyButton).toHaveAccessibleDescription('Validate the conflict choices to copy the prompt.');

    const prompt = screen.getByTestId('mapped-theme-prompt');
    expect(prompt.textContent).toContain('Backup (coding theme): https://luongnv.com/sleek-ui/designs/aura.json');

    fireEvent.click(screen.getByLabelText(/Keep original \(0 62.8% 30.6%\)/));
    expect(prompt.textContent).toContain('Selected: keep original → 0 62.8% 30.6%');

    fireEvent.click(screen.getByLabelText(/reviewed these choices/));
    expect(copyButton).toBeEnabled();

    // Changing a choice again requires re-validation.
    fireEvent.click(screen.getByLabelText(/Use suggestion \(0 100% 70%\)/));
    expect(copyButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('App target'), { target: { value: 'vscode' } });
    expect(prompt.textContent).toContain('APPLY INSTRUCTIONS (VS Code)');
  });

  it('renders the three-part flow through the shared ThemePairTriad (#196 AC1)', async () => {
    renderPanel();
    expect(screen.getByTestId('theme-pair-triad')).toBeInTheDocument();
    expect(screen.getByText('Web theme')).toBeInTheDocument();
    expect(screen.getByText('Backup terminal theme')).toBeInTheDocument();
    expect(screen.getByText('Mapped coding theme')).toBeInTheDocument();
    // The web part names this design; the result part waits on a backup.
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('Select a backup theme')).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Backup terminal theme'), { target: { value: 'aura' } });
    });
    expect(screen.getByText('apple × aura')).toBeInTheDocument();
  });

  it('keeps the copy status out of role=status so the backup loader stays the only one', async () => {
    renderPanel();
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Backup terminal theme'), { target: { value: 'aura' } });
    });
    // Exactly one role=status (the backup loader). The copy status is aria-live only,
    // so a copy outcome never clobbers the load announcement.
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Copy/ })).toHaveAccessibleDescription(
      'Validate the conflict choices to copy the prompt.',
    );
  });

  it('shows an error when the backup theme fails to load', async () => {
    render(
      <CodingThemeMappingPanel websiteUrl="u" websiteName="n" websiteData={apple as unknown as DesignData} backupThemes={[auraTheme]} loadBackup={() => Promise.resolve(null)} />,
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Backup terminal theme'), { target: { value: 'aura' } });
    });
    expect(screen.getByRole('status')).toHaveTextContent('Could not load the backup theme');
    expect(screen.getByRole('status')).toHaveClass('text-destructive');
  });

  it('shows an error when loading the backup theme rejects', async () => {
    render(
      <CodingThemeMappingPanel websiteUrl="u" websiteName="n" websiteData={apple as unknown as DesignData} backupThemes={[auraTheme]} loadBackup={() => Promise.reject(new Error('network'))} />,
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Backup terminal theme'), { target: { value: 'aura' } });
    });
    expect(screen.getByRole('status')).toHaveTextContent('Could not load the backup theme');
  });
});
