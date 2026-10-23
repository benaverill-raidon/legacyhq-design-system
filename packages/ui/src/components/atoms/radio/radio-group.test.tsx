// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio } from './radio';
import { RadioGroup } from './radio-group';

const radioCss = readFileSync('packages/ui/src/components/atoms/radio/radio.module.css', 'utf8');

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
  it('hides the legend * from assistive technology and announces the requirement natively', () => {
    render(<RadioGroup label="Required" name="required" required options={options} />);

    expect(screen.getByRole('group', { name: 'Required' })).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeRequired();
    });
  });

  it('keeps a per-option * on that option only', () => {
    render(
      <RadioGroup
        label="Contact"
        name="contact"
        options={[
          { value: 'email', label: 'Email', required: true },
          { value: 'phone', label: 'Phone' },
        ]}
      />,
    );

    expect(screen.getAllByText('*')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Email' })).toBeRequired();
    expect(screen.getByRole('radio', { name: 'Phone' })).not.toBeRequired();
  });

  it('makes radios from children required when the group is, without their own *', () => {
    render(
      <RadioGroup label="Composed" required>
        <Radio label="Composed one" name="composed" value="one" />
        <Radio label="Composed two" name="composed" value="two" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Composed one' })).toBeRequired();
    expect(screen.getByRole('radio', { name: 'Composed two' })).toBeRequired();
    expect(screen.getAllByText('*')).toHaveLength(1);
  });

  it('shows radios from children as disabled when the group is disabled', () => {
    render(
      <RadioGroup label="Composed" disabled>
        <Radio label="Composed one" name="composed" value="one" />
        <Radio label="Composed two" name="composed" value="two" />
      </RadioGroup>,
    );

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
      expect(radio.closest('label')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('shows radios from options as disabled when the group is disabled', () => {
    render(<RadioGroup label="Disabled" name="disabled" disabled options={options} />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio.closest('label')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('spaces horizontal options apart, and keeps wrapped rows flush', () => {
    expect(radioCss).toMatch(/\.orientation_horizontal \.options \{[^}]*column-gap: var\(--spacing-lg\);/s);
    expect(radioCss).not.toMatch(/\.orientation_horizontal \.options \{[^}]*row-gap/s);
  });

  it('uses zero group gap for compact radio groups', () => {
    expect(radioCss).toMatch(/\.options \{[^}]*gap: var\(--spacing-none\);/);
    expect(radioCss).not.toContain('gap: -');
  });

  it("styles the legend as Field's label: its type style and color, and a `*` with no gap", () => {
    const fieldCss = readFileSync('packages/ui/src/components/molecules/field/field.module.css', 'utf8');
    const rule = (css: string, selector: string) =>
      css.match(new RegExp(`(?:^|\\n)${selector.replace(/\./g, '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    const declarations = (block: string) =>
      block.split(';').map((line) => line.trim()).filter((line) => /^(color|font-|line-height|letter-spacing)/.test(line));

    const fieldLabel = declarations(rule(fieldCss, '.label'));
    expect(fieldLabel).toContain('font-size: var(--typography-heading-xxs-font-size)');
    expect(declarations(rule(radioCss, '.legend')).sort()).toEqual(fieldLabel.sort());
    // Field's `*` follows the label text directly; the legend's does too.
    expect(rule(fieldCss, '.required')).not.toContain('margin');
    expect(rule(radioCss, '.legend .requiredIndicator')).toContain('margin-inline-start: var(--spacing-none);');
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
    expect(declarations(rule(radioCss, '.description'), type).sort()).toEqual(fieldType.sort());
    expect(declarations(rule(radioCss, '.errorMessage'), type).sort()).toEqual(fieldType.sort());
    // Field's resting message is the description's color; its error state is the error message's.
    expect(declarations(rule(radioCss, '.description'), color)).toEqual(declarations(rule(fieldCss, '.message'), color));
    expect(declarations(rule(radioCss, '.errorMessage'), color)).toEqual(
      declarations(rule(fieldCss, '.state_error .message'), color),
    );
    // Field's message sits a step below its control; the group's text sits the same step below what's above it.
    expect(rule(fieldCss, '.message')).toContain('padding-top: var(--spacing-xs);');
    expect(rule(radioCss, '.description')).toContain('margin-block-start: var(--spacing-xs);');
    expect(rule(radioCss, '.errorMessage')).toContain('margin-block-start: var(--spacing-xs);');
  });
});
