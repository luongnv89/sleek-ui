import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar (#120)', () => {
  it('renders an input labelled by its placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Find designs" />);
    const input = screen.getByRole('textbox', { name: 'Find designs' });
    expect(input).toHaveAttribute('placeholder', 'Find designs');
  });

  it('propagates typing to onChange', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'neo' } });
    expect(onChange).toHaveBeenCalledWith('neo');
  });

  it('shows the clear button only while there is a value, and clears on click', () => {
    const onChange = jest.fn();
    const { rerender } = render(<SearchBar value="" onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    rerender(<SearchBar value="dark" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('clears the query on Escape', () => {
    const onChange = jest.fn();
    render(<SearchBar value="dark" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});
