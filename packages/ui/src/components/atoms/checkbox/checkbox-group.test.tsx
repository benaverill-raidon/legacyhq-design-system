// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from './checkbox';
import { CheckboxGroup } from './checkbox-group';

const checkboxCss = readFileSync('packages/ui/src/components/atoms/checkbox/checkbox.module.css', 'utf8');

const options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'three', label: 'Three' },
];

afterEach(cleanup);

describe('CheckboxGroup', () => {
  it('renders group label with fieldset and legend semantics', () => {
    render(<CheckboxGroup label="Choose items" name="choice" options={options} />);

    expect(screen.getByRole('group', { name: 'Choose items' })).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<CheckboxGroup label="Choose items" name="choice" options={options} />);

    expect(screen.getByRole('checkbox', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Two' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Three' })).toBeInTheDocument();
  });

  it('supports controlled value', () => {
    const { rerender } = render(
      <CheckboxGroup
        label="Controlled"
        name="controlled"
        value={['one']}
        onValueChange={() => undefined}
        options={options}
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'One' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Two' })).not.toBeChecked();

    rerender(
      <CheckboxGroup
        label="Controlled"
        name="controlled"
        value={['one', 'two']}
        onValueChange={() => undefined}
        options={options}
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'One' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Two' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Three' })).not.toBeChecked();
  });

  it('supports defaultValue', () => {
    render(<CheckboxGroup label="Default" name="default" defaultValue={['two', 'three']} options={options} />);

    expect(screen.getByRole('checkbox', { name: 'One' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Two' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Three' })).toBeChecked();
  });

  it('supports uncontrolled usage', () => {
    const handleValueChange = vi.fn();

    render(
      <CheckboxGroup label="Uncontrolled" name="uncontrolled" options={options} onValueChange={handleValueChange} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'One' }));

    expect(handleValueChange).toHaveBeenCalledWith(['one'], expect.any(Object));

    fireEvent.click(screen.getByRole('checkbox', { name: 'Three' }));

    expect(handleValueChange).toHaveBeenCalledWith(['one', 'three'], expect.any(Object));
  });

  it('calls onValueChange removing unchecked value', () => {
    const handleValueChange = vi.fn();

    render(
      <CheckboxGroup
        label="Toggle"
        name="toggle"
        value={['one', 'two']}
        onValueChange={handleValueChange}
        options={options}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'One' }));

    expect(handleValueChange).toHaveBeenCalledWith(['two'], expect.any(Object));
  });

  it('passes shared name to options', () => {
    render(<CheckboxGroup label="Choose items" name="shared-name" options={options} />);

    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('name', 'shared-name');
    });
  });

  it('supports required group', () => {
    render(<CheckboxGroup label="Required" name="required" required options={options} />);

    expect(screen.getAllByText('*')).toHaveLength(1);
  });

  it('supports invalid group', () => {
    render(<CheckboxGroup label="Invalid" name="invalid" invalid options={options} />);

    expect(screen.getByRole('group', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('associates error message with group', () => {
    render(
      <CheckboxGroup
        label="Invalid"
        name="invalid"
        invalid
        errorMessage="Select at least one."
        options={options}
      />,
    );

    const error = screen.getByText('Select at least one.');
    const group = screen.getByRole('group', { name: 'Invalid' });

    expect(error.id).toBeTruthy();
    expect(group).toHaveAttribute('aria-describedby', expect.stringContaining(error.id));
  });

  it('supports disabled group', () => {
    render(<CheckboxGroup label="Disabled" name="disabled" disabled options={options} />);

    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('supports children composition', () => {
    render(
      <CheckboxGroup label="Composed">
        <Checkbox label="Composed one" name="composed" value="one" />
        <Checkbox label="Composed two" name="composed" value="two" />
      </CheckboxGroup>,
    );

    expect(screen.getByRole('checkbox', { name: 'Composed one' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Composed two' })).toBeInTheDocument();
  });

  it('uses zero group gap for compact checkbox groups', () => {
    expect(checkboxCss).toMatch(/\.options \{[^}]*gap: var\(--spacing-none\);/);
    expect(checkboxCss).not.toContain('gap: -');
  });

  it('renders description text', () => {
    render(
      <CheckboxGroup label="Prefs" name="prefs" description="Select all that apply." options={options} />,
    );

    expect(screen.getByText('Select all that apply.')).toBeInTheDocument();
  });
});
