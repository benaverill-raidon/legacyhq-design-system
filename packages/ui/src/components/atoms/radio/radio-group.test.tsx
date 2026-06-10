import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio } from './radio';
import { RadioGroup } from './radio-group';

const options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'three', label: 'Three' },
];

afterEach(cleanup);

describe('RadioGroup', () => {
  it('renders group label with fieldset and legend semantics', () => {
    render(<RadioGroup label="Choose one" name="choice" options={options} />);

    expect(screen.getByRole('group', { name: 'Choose one' })).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<RadioGroup label="Choose one" name="choice" options={options} />);

    expect(screen.getByRole('radio', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Two' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Three' })).toBeInTheDocument();
  });

  it('supports controlled value', () => {
    const { rerender } = render(
      <RadioGroup label="Controlled" name="controlled" value="one" onValueChange={() => undefined} options={options} />,
    );

    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Two' })).not.toBeChecked();

    rerender(
      <RadioGroup label="Controlled" name="controlled" value="two" onValueChange={() => undefined} options={options} />,
    );

    expect(screen.getByRole('radio', { name: 'One' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
  });

  it('supports defaultValue', () => {
    render(<RadioGroup label="Default" name="default" defaultValue="two" options={options} />);

    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
  });

  it('supports uncontrolled usage', () => {
    render(<RadioGroup label="Uncontrolled" name="uncontrolled" options={options} />);

    const first = screen.getByRole('radio', { name: 'One' });
    const second = screen.getByRole('radio', { name: 'Two' });

    fireEvent.click(first);
    fireEvent.click(second);

    expect(first).not.toBeChecked();
    expect(second).toBeChecked();
  });

  it('calls onValueChange with selected value and event', () => {
    const handleValueChange = vi.fn();

    render(<RadioGroup label="Choose one" name="choice" options={options} onValueChange={handleValueChange} />);

    const second = screen.getByRole('radio', { name: 'Two' });

    fireEvent.click(second);

    expect(handleValueChange).toHaveBeenCalledTimes(1);
    expect(handleValueChange).toHaveBeenCalledWith('two', expect.objectContaining({ target: second }));
  });

  it('passes shared name to options', () => {
    render(<RadioGroup label="Choose one" name="shared-name" options={options} />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveAttribute('name', 'shared-name');
    });
  });

  it('supports required group', () => {
    render(<RadioGroup label="Required" name="required" required options={options} />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeRequired();
    });
    expect(screen.getAllByText('*')).toHaveLength(1);
  });

  it('supports invalid group', () => {
    render(<RadioGroup label="Invalid" name="invalid" invalid options={options} />);

    expect(screen.getByRole('group', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('associates error message with group and radios', () => {
    render(
      <RadioGroup
        label="Invalid"
        name="invalid"
        invalid
        errorMessage="Choose one option."
        options={options}
      />,
    );

    const error = screen.getByText('Choose one option.');
    const group = screen.getByRole('group', { name: 'Invalid' });

    expect(error.id).toBeTruthy();
    expect(group).toHaveAttribute('aria-describedby', expect.stringContaining(error.id));
    expect(screen.getByRole('radio', { name: 'One' })).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(error.id),
    );
  });

  it('supports disabled group', () => {
    render(<RadioGroup label="Disabled" name="disabled" disabled options={options} />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('supports children composition', () => {
    render(
      <RadioGroup label="Composed">
        <Radio label="Composed one" name="composed" value="one" />
        <Radio label="Composed two" name="composed" value="two" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Composed one' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Composed two' })).toBeInTheDocument();
  });

  it('keeps native radios focusable for keyboard navigation', () => {
    render(<RadioGroup label="Keyboard" name="keyboard" options={options} />);

    const first = screen.getByRole('radio', { name: 'One' });

    first.focus();

    expect(first).toHaveFocus();
  });
});
