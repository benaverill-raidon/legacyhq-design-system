// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Radio } from './radio';
import styles from './radio.module.css';
import type { RadioProps } from './radio.types';

const radioCss = readFileSync('packages/ui/src/components/atoms/radio/radio.module.css', 'utf8');
const tokenCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');

afterEach(cleanup);

describe('Radio', () => {
  it('renders a native radio input', () => {
    render(<Radio aria-label="Select row" name="row" value="one" />);

    expect(screen.getByRole('radio', { name: 'Select row' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Select row' }).tagName).toBe('INPUT');
  });

  it('renders a visible label', () => {
    render(<Radio label="Label" name="example" value="label" />);

    expect(screen.getByRole('radio', { name: 'Label' })).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('supports checked state', () => {
    render(<Radio label="Checked" name="checked" value="checked" checked onCheckedChange={() => undefined} />);

    expect(screen.getByRole('radio', { name: 'Checked' })).toBeChecked();
  });

  it('supports defaultChecked state', () => {
    render(<Radio label="Default checked" name="default" value="default" defaultChecked />);

    expect(screen.getByRole('radio', { name: 'Default checked' })).toBeChecked();
  });

  it('supports unchecked state', () => {
    render(<Radio label="Unchecked" name="unchecked" value="unchecked" />);

    expect(screen.getByRole('radio', { name: 'Unchecked' })).not.toBeChecked();
  });

  it('renders the unchecked radio icon', () => {
    render(<Radio label="Unchecked icon" name="unchecked-icon" value="unchecked" />);

    expect(screen.getByTestId('radio-unchecked-icon')).toBeInTheDocument();
    expect(screen.getByTestId('radio-unchecked-icon').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the checked radio icon', () => {
    render(<Radio label="Checked icon" name="checked-icon" value="checked" defaultChecked />);

    expect(screen.getByTestId('radio-checked-icon')).toBeInTheDocument();
    expect(screen.getByTestId('radio-checked-icon').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports disabled state', () => {
    render(<Radio label="Disabled" name="disabled" value="disabled" disabled />);

    expect(screen.getByRole('radio', { name: 'Disabled' })).toBeDisabled();
  });

  it('supports invalid state', () => {
    const { container } = render(<Radio label="Invalid" name="invalid" value="invalid" invalid />);

    expect(screen.getByRole('radio', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('label')).toHaveAttribute('data-invalid', 'true');
  });

  it('supports required state', () => {
    render(<Radio label="Required" name="required" value="required" required />);

    expect(screen.getByRole('radio', { name: /Required/ })).toBeRequired();
    expect(screen.getByText('*')).toHaveClass(styles.requiredIndicator);
  });

  it('hides the required * from assistive technology, so the name is the label alone', () => {
    render(<Radio label="Required" name="required" value="required" required />);

    expect(screen.getByRole('radio', { name: 'Required' })).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps showRequiredIndicator off the public props', () => {
    const props: RadioProps = {
      label: 'Internal',
      // @ts-expect-error Radio Group's required-indicator handling is internal, not a Radio prop.
      showRequiredIndicator: false,
    };

    expect(props.label).toBe('Internal');
  });

  it('uses the shared focus ring primitive on the input, offset inward to the visible circle', () => {
    render(<Radio label="Focusable" name="focusable" value="focusable" />);

    expect(screen.getByRole('radio', { name: 'Focusable' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
    expect(radioCss).toContain(
      '--focus-ring-offset: calc((var(--size-choice-target) - var(--size-choice-indicator)) / -2);',
    );
    expect(radioCss).not.toContain('::after');
    expect(radioCss).not.toMatch(/\.input:focus-visible \{[^}]*outline: none/s);
  });

  it('pins the shared focus ring for previewFocus, from the primitive variables', () => {
    expect(radioCss).toMatch(
      /\.radio:global\(\.previewFocus\):not\(\[data-disabled='true'\], :where\(:has\(\.input:disabled\)\)\) \.input \{[^}]*outline: var\(--focus-ring-width\) solid var\(--focus-ring-color\);[^}]*outline-offset: var\(--focus-ring-offset\);/s,
    );
  });

  it('dims a disabled radio with the disabled color only, like Checkbox', () => {
    expect(radioCss).toMatch(/\.radio:is\(\[data-disabled='true'\], :where\(:has\(\.input:disabled\)\)\) \{[^}]*color: var\(--color-content-disabled\);/s);
    expect(radioCss).toMatch(/\.radio:is\(\[data-disabled='true'\], :where\(:has\(\.input:disabled\)\)\) \.indicatorIcon \{[^}]*color: var\(--color-content-disabled\);/s);
    expect(radioCss).not.toContain('opacity');
  });

  it('supports aria-label when label is omitted', () => {
    render(<Radio aria-label="Select current row" name="row" value="current" />);

    expect(screen.getByRole('radio', { name: 'Select current row' })).toBeInTheDocument();
  });

  it('supports custom className and inputClassName', () => {
    const { container } = render(
      <Radio label="Custom" name="custom" value="custom" className="custom-radio" inputClassName="custom-input" />,
    );

    expect(container.querySelector('label')).toHaveClass(styles.radio, 'custom-radio');
    expect(screen.getByRole('radio', { name: 'Custom' })).toHaveClass(styles.input, 'custom-input');
  });

  it('calls onCheckedChange with the next checked value and event', () => {
    const handleCheckedChange = vi.fn();

    render(<Radio label="Notify" name="notify" value="notify" onCheckedChange={handleCheckedChange} />);

    const radio = screen.getByRole('radio', { name: 'Notify' });

    fireEvent.click(radio);

    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ target: radio }));
  });

  it('forwards native input props', () => {
    render(<Radio label="Named" name="matter" value="123" data-testid="matter-radio" />);

    const radio = screen.getByTestId('matter-radio');

    expect(radio).toHaveAttribute('name', 'matter');
    expect(radio).toHaveAttribute('value', '123');
  });

  it('uses expected base classes and indicator focus anatomy', () => {
    const { container } = render(<Radio label="Classes" name="classes" value="classes" />);
    const input = screen.getByRole('radio', { name: 'Classes' });

    expect(container.querySelector('label')).toHaveClass(styles.radio);
    expect(input).toHaveClass(styles.input);
    expect(container.querySelector(`.${styles.indicatorTarget}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.indicatorFocus}`)).toBeInTheDocument();
  });

  it('does not add a manual radio role', () => {
    render(<Radio label="Native" name="native" value="native" />);

    expect(screen.getByRole('radio', { name: 'Native' }).tagName).toBe('INPUT');
  });

  it('matches the current figma token mappings for target, icon, and focus treatments', () => {
    expect(radioCss).toMatch(/\.indicatorTarget \{[^}]*background: transparent;/s);
    expect(radioCss).toMatch(/\.indicatorIcon \{[^}]*color: var\(--color-content-subtle\);/s);
    expect(radioCss).toMatch(/\.checkedIcon \{[^}]*color: var\(--color-content-brand-primary-default\);/s);
    expect(radioCss).toContain('background: var(--color-background-neutral-overlay-bold-hover);');
    expect(radioCss).toContain('background: var(--color-background-neutral-overlay-bold-press);');
    expect(radioCss).toContain('background: var(--color-background-brand-primary-overlay-hover);');
    expect(radioCss).toContain('background: var(--color-background-brand-primary-overlay-press);');
    expect(radioCss).toMatch(/\.radio\[data-invalid='true'\] \.indicatorIcon \{[^}]*color: var\(--color-content-error\);/s);
    expect(radioCss).not.toContain('border: var(--border-width-md) solid var(--color-border-focus);');
  });

  it('uses compact density tokens for item, target, and focus anatomy', () => {
    expect(radioCss).toMatch(/\.radio \{[^}]*gap: var\(--spacing-xxs\);/s);
    expect(radioCss).toContain('min-block-size: var(--size-choice-row);');
    expect(radioCss).toContain('block-size: var(--size-choice-row);');
    expect(radioCss).toContain('inline-size: var(--size-choice-target);');
    expect(radioCss).toContain('block-size: var(--size-choice-target);');
    expect(radioCss).toContain('inline-size: var(--size-choice-indicator);');
    expect(radioCss).toContain('block-size: var(--size-choice-indicator);');
    expect(radioCss).toMatch(/\.indicatorFocus \{[^}]*border-radius: var\(--border-radius-full-round\);/s);
    expect(tokenCss).not.toContain('--component-radio-indicator-focus-size:');
  });
});


