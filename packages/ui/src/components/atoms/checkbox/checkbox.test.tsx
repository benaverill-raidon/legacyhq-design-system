// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from './checkbox';
import styles from './checkbox.module.css';

const checkboxCss = readFileSync('packages/ui/src/components/atoms/checkbox/checkbox.module.css', 'utf8');
const tokenCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');

afterEach(cleanup);

describe('Checkbox', () => {
  it('renders a native checkbox', () => {
    render(<Checkbox aria-label="Select row" />);

    expect(screen.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select row' }).tagName).toBe('INPUT');
  });

  it('renders a visible label', () => {
    render(<Checkbox label="Send updates" />);

    expect(screen.getByRole('checkbox', { name: 'Send updates' })).toBeInTheDocument();
    expect(screen.getByText('Send updates')).toBeInTheDocument();
  });

  it('supports uncontrolled usage', () => {
    render(<Checkbox label="Archive matter" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Archive matter' });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<Checkbox label="Controlled" checked={false} onCheckedChange={() => undefined} />);

    expect(screen.getByRole('checkbox', { name: 'Controlled' })).not.toBeChecked();

    rerender(<Checkbox label="Controlled" checked onCheckedChange={() => undefined} />);

    expect(screen.getByRole('checkbox', { name: 'Controlled' })).toBeChecked();
  });

  it('supports checked state', () => {
    render(<Checkbox label="Checked" defaultChecked />);

    expect(screen.getByRole('checkbox', { name: 'Checked' })).toBeChecked();
  });

  it('calls onCheckedChange with the next checked value and event', () => {
    const handleCheckedChange = vi.fn();

    render(<Checkbox label="Notify" onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Notify' });

    fireEvent.click(checkbox);

    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ target: checkbox }));
  });

  it('applies indeterminate state', () => {
    render(<Checkbox label="Select all" indeterminate />);

    const checkbox = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;

    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('lets indeterminate visually override checked', () => {
    const { container } = render(<Checkbox label="Mixed" checked indeterminate onCheckedChange={() => undefined} />);
    const root = container.querySelector('label');

    expect(root).toHaveAttribute('data-indeterminate', 'true');
    expect(screen.getByRole('checkbox', { name: 'Mixed' })).toBeChecked();
  });

  it('renders the unchecked checkbox icon', () => {
    render(<Checkbox label="Unchecked icon" />);

    expect(screen.getByTestId('checkbox-empty-icon')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox-empty-icon').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the checked checkbox icon', () => {
    render(<Checkbox label="Checked icon" defaultChecked />);

    expect(screen.getByTestId('checkbox-fill-icon')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox-fill-icon').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the indeterminate checkbox icon', () => {
    render(<Checkbox label="Indeterminate icon" indeterminate />);

    expect(screen.getByTestId('checkbox-indeterminate-icon')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox-indeterminate-icon').querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('applies disabled state and prevents interaction', () => {
    const handleCheckedChange = vi.fn();

    render(<Checkbox label="Disabled" disabled onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Disabled' });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(screen.getByText('Disabled'));

    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeChecked();
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it('applies invalid state', () => {
    const { container } = render(<Checkbox label="Invalid" invalid />);

    expect(screen.getByRole('checkbox', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('label')).toHaveAttribute('data-invalid', 'true');
  });

  it('applies required state', () => {
    render(<Checkbox label="Required" required />);

    expect(screen.getByRole('checkbox', { name: /Required/ })).toBeRequired();
    expect(screen.getByText('*')).toHaveClass(styles.requiredIndicator);
  });

  it('supports custom className', () => {
    const { container } = render(<Checkbox label="Custom" className="custom-checkbox" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, 'custom-checkbox');
  });

  it('forwards native input props', () => {
    render(<Checkbox label="Named" name="matter" value="123" data-testid="matter-checkbox" />);

    const checkbox = screen.getByTestId('matter-checkbox');

    expect(checkbox).toHaveAttribute('name', 'matter');
    expect(checkbox).toHaveAttribute('value', '123');
  });

  it('supports keyboard focus on the native checkbox', () => {
    render(<Checkbox label="Keyboard" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Keyboard' });

    checkbox.focus();

    expect(checkbox).toHaveFocus();
  });

  it('toggles when the label is clicked', () => {
    render(<Checkbox label="Click label" />);

    fireEvent.click(screen.getByText('Click label'));

    expect(screen.getByRole('checkbox', { name: 'Click label' })).toBeChecked();
  });

  it('supports aria-label when label is omitted', () => {
    render(<Checkbox aria-label="Select current row" />);

    expect(screen.getByRole('checkbox', { name: 'Select current row' })).toBeInTheDocument();
  });

  it('uses expected base classes and indicator focus anatomy', () => {
    const { container } = render(<Checkbox label="Classes" />);
    const input = screen.getByRole('checkbox', { name: 'Classes' });

    expect(container.querySelector('label')).toHaveClass(styles.root);
    expect(input).toHaveClass(styles.input);
    expect(container.querySelector(`.${styles.indicatorTarget}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.indicatorFocus}`)).toBeInTheDocument();
  });
  it('uses compact density tokens for item, target, and focus anatomy', () => {
    expect(checkboxCss).toMatch(/\.root \{[^}]*gap: var\(--spacing-025\);/);
    expect(checkboxCss).toMatch(/\.input:focus,\s*\.input:focus-visible \{[^}]*outline: none;/);
    expect(checkboxCss).toContain('.input:focus-visible + .indicatorTarget .indicatorFocus {');
    expect(checkboxCss).not.toContain('.input:focus-visible + .indicatorTarget {');
    expect(checkboxCss).not.toMatch(/\.indicatorTarget \{[^}]*outline:/);
    expect(checkboxCss).toContain('min-block-size: var(--component-checkbox-item-min-height);');
    expect(checkboxCss).toContain('block-size: var(--component-checkbox-item-min-height);');
    expect(checkboxCss).toContain('inline-size: var(--component-checkbox-hit-area-size);');
    expect(checkboxCss).toContain('block-size: var(--component-checkbox-hit-area-size);');
    expect(checkboxCss).toContain('inline-size: var(--component-checkbox-indicator-focus-size);');
    expect(checkboxCss).toContain('block-size: var(--component-checkbox-indicator-focus-size);');
    expect(checkboxCss).toMatch(/\.indicatorFocus \{[^}]*border-radius: var\(--border-radius-sm\);/);
    expect(tokenCss).toContain('--component-checkbox-indicator-focus-size: var(--dimension-16);');
    expect(checkboxCss).toContain('inline-size: var(--component-checkbox-indicator-size);');
    expect(checkboxCss).toContain('block-size: var(--component-checkbox-indicator-size);');
    expect(checkboxCss).toContain('outline-offset: var(--spacing-0);');
  });
});
