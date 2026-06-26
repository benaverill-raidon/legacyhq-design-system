import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Switch } from './switch';
import styles from './switch.module.css';

afterEach(cleanup);

describe('Switch', () => {
  it('renders a native checkbox with switch semantics', () => {
    render(<Switch aria-label="Enable setting" />);

    const switchInput = screen.getByRole('switch', { name: 'Enable setting' });

    expect(switchInput).toBeInTheDocument();
    expect(switchInput).toHaveAttribute('type', 'checkbox');
  });

  it('renders a visible label', () => {
    render(<Switch label="Email notifications" />);

    expect(screen.getByRole('switch', { name: 'Email notifications' })).toBeInTheDocument();
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
  });

  it('associates the label with the input', () => {
    const { container } = render(<Switch label="Associated label" id="associated-switch" />);
    const label = container.querySelector('label');

    expect(label).toHaveAttribute('for', 'associated-switch');
    expect(screen.getByLabelText('Associated label')).toHaveAttribute('id', 'associated-switch');
  });

  it('supports unchecked state', () => {
    render(<Switch label="Unchecked" />);

    expect(screen.getByRole('switch', { name: 'Unchecked' })).not.toBeChecked();
  });

  it('uses md as the default size', () => {
    const { container } = render(<Switch label="Default size" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, styles.size_md);
  });

  it('supports sm size', () => {
    const { container } = render(<Switch label="Small size" size="sm" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, styles.size_sm);
  });

  it('supports checked state', () => {
    render(<Switch label="Checked" checked onCheckedChange={() => undefined} />);

    expect(screen.getByRole('switch', { name: 'Checked' })).toBeChecked();
  });

  it('supports uncontrolled defaultChecked state', () => {
    render(<Switch label="Default checked" defaultChecked />);

    expect(screen.getByRole('switch', { name: 'Default checked' })).toBeChecked();
  });

  it('supports uncontrolled interaction', () => {
    render(<Switch label="Interactive" />);

    const switchInput = screen.getByRole('switch', { name: 'Interactive' });

    fireEvent.click(switchInput);

    expect(switchInput).toBeChecked();
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Switch label="Controlled" checked={false} onCheckedChange={() => undefined} />);

    expect(screen.getByRole('switch', { name: 'Controlled' })).not.toBeChecked();

    rerender(<Switch label="Controlled" checked onCheckedChange={() => undefined} />);

    expect(screen.getByRole('switch', { name: 'Controlled' })).toBeChecked();
  });

  it('calls onCheckedChange with the next checked value and event', () => {
    const handleCheckedChange = vi.fn();

    render(<Switch label="Notify" onCheckedChange={handleCheckedChange} />);

    const switchInput = screen.getByRole('switch', { name: 'Notify' });

    fireEvent.click(switchInput);

    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ target: switchInput }));
  });

  it('supports disabled state', () => {
    const handleCheckedChange = vi.fn();

    render(<Switch label="Disabled" disabled onCheckedChange={handleCheckedChange} />);

    const switchInput = screen.getByRole('switch', { name: 'Disabled' });

    expect(switchInput).toBeDisabled();

    fireEvent.click(switchInput);

    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it('supports required state', () => {
    render(<Switch label="Required" required />);

    expect(screen.getByRole('switch', { name: /Required/ })).toBeRequired();
    expect(screen.getByText('*')).toHaveClass(styles.requiredIndicator);
  });

  it('supports custom className', () => {
    const { container } = render(<Switch label="Custom" className="custom-switch" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, 'custom-switch');
  });

  it('forwards native input props', () => {
    render(<Switch label="Named" name="matter" value="enabled" data-testid="matter-switch" />);

    const switchInput = screen.getByTestId('matter-switch');

    expect(switchInput).toHaveAttribute('name', 'matter');
    expect(switchInput).toHaveAttribute('value', 'enabled');
  });

  it('supports aria-label when label is omitted', () => {
    render(<Switch aria-label="Enable current row" />);

    expect(screen.getByRole('switch', { name: 'Enable current row' })).toBeInTheDocument();
  });

  it('keeps the native input focusable for keyboard users', () => {
    render(<Switch label="Keyboard" />);

    const switchInput = screen.getByRole('switch', { name: 'Keyboard' });

    switchInput.focus();

    expect(switchInput).toHaveFocus();
    expect(switchInput).toHaveClass(focusRingClassNames.focusRing, focusRingClassNames.focusRingDefault);
  });

  it('renders private decorative indicator parts without shared icons', () => {
    const { container } = render(<Switch label="Decorative indicator" />);
    const indicator = container.querySelector(`.${styles.indicator}`);

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});


