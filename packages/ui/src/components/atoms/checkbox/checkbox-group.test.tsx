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

  it('announces a required group in its name and hides the * from assistive technology', () => {
    render(<CheckboxGroup label="Channels" name="required" required options={options} />);

    expect(screen.getByRole('group', { name: 'Channels required' })).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    // The group's requirement is "at least one", so no single checkbox is natively required.
    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).not.toBeRequired();
    });
  });

  it('takes a translated requiredLabel', () => {
    render(<CheckboxGroup label="Canaux" name="required" required requiredLabel="obligatoire" options={options} />);

    expect(screen.getByRole('group', { name: 'Canaux obligatoire' })).toBeInTheDocument();
  });

  it('leaves the name alone when the group is not required', () => {
    render(<CheckboxGroup label="Channels" name="optional" options={options} />);

    expect(screen.getByRole('group', { name: 'Channels' })).toBeInTheDocument();
  });

  it('shows checkboxes from children as disabled when the group is disabled', () => {
    render(
      <CheckboxGroup label="Composed" disabled>
        <Checkbox label="Composed one" name="composed" value="one" />
        <Checkbox label="Composed two" name="composed" value="two" />
      </CheckboxGroup>,
    );

    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
      expect(checkbox.closest('label')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('shows checkboxes from options as disabled when the group is disabled', () => {
    render(<CheckboxGroup label="Disabled" name="disabled" disabled options={options} />);

    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox.closest('label')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('spaces horizontal options apart, and keeps wrapped rows flush', () => {
    expect(checkboxCss).toMatch(/\.orientation_horizontal \.options \{[^}]*column-gap: var\(--spacing-lg\);/s);
    expect(checkboxCss).not.toMatch(/\.orientation_horizontal \.options \{[^}]*row-gap/s);
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

  it("styles the legend as Field's label: its type style and color, and a `*` with no gap", () => {
    const fieldCss = readFileSync('packages/ui/src/components/molecules/field/field.module.css', 'utf8');
    const rule = (css: string, selector: string) =>
      css.match(new RegExp(`(?:^|\\n)${selector.replace(/\./g, '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    const declarations = (block: string) =>
      block.split(';').map((line) => line.trim()).filter((line) => /^(color|font-|line-height|letter-spacing)/.test(line));

    const fieldLabel = declarations(rule(fieldCss, '.label'));
    expect(fieldLabel).toContain('font-size: var(--typography-heading-xxs-font-size)');
    expect(declarations(rule(checkboxCss, '.legend')).sort()).toEqual(fieldLabel.sort());
    // Field's `*` follows the label text directly; the legend's does too.
    expect(rule(fieldCss, '.required')).not.toContain('margin');
    expect(rule(checkboxCss, '.legend .requiredIndicator')).toContain('margin-inline-start: var(--spacing-none);');
  });

  it("styles the description and error message as Field's message: its type style, color, and space above", () => {
    const fieldCss = readFileSync('packages/ui/src/components/molecules/field/field.module.css', 'utf8');
    const rule = (css: string, selector: string) =>
      css.match(new RegExp(`(?:^|\\n)${selector.replace(/\./g, '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    const declarations = (block: string, pattern: RegExp) =>
      block.split(';').map((line) => line.trim()).filter((line) => pattern.test(line));
    const type = /^(font-|line-height|letter-spacing)/;
    const color = /^color:/;

    const fieldType = declarations(rule(fieldCss, '.message'), type);
    expect(fieldType).toContain('font-size: var(--typography-body-sm-font-size)');
    expect(declarations(rule(checkboxCss, '.description'), type).sort()).toEqual(fieldType.sort());
    expect(declarations(rule(checkboxCss, '.errorMessage'), type).sort()).toEqual(fieldType.sort());
    // Field's resting message is the description's color; its error state is the error message's.
    expect(declarations(rule(checkboxCss, '.description'), color)).toEqual(declarations(rule(fieldCss, '.message'), color));
    expect(declarations(rule(checkboxCss, '.errorMessage'), color)).toEqual(
      declarations(rule(fieldCss, '.state_error .message'), color),
    );
    // Field's message sits a step below its control; the group's text sits the same step below what's above it.
    expect(rule(fieldCss, '.message')).toContain('padding-top: var(--spacing-xs);');
    expect(rule(checkboxCss, '.description')).toContain('margin-block-start: var(--spacing-xs);');
    expect(rule(checkboxCss, '.errorMessage')).toContain('margin-block-start: var(--spacing-xs);');
  });
});
