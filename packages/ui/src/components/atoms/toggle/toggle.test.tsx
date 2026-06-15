import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Toggle } from './toggle';
import styles from './toggle.module.css';

afterEach(cleanup);

describe('Toggle', () => {
  it('renders a native checkbox with switch semantics', () => {
    render(<Toggle aria-label="Enable setting" />);

    const toggle = screen.getByRole('switch', { name: 'Enable setting' });

    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('type', 'checkbox');
  });

  it('renders a visible label', () => {
    render(<Toggle label="Email notifications" />);

    expect(screen.getByRole('switch', { name: 'Email notifications' })).toBeInTheDocument();
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
  });

  it('associates the label with the input', () => {
    const { container } = render(<Toggle label="Associated label" id="associated-toggle" />);
    const label = container.querySelector('label');

    expect(label).toHaveAttribute('for', 'associated-toggle');
    expect(screen.getByLabelText('Associated label')).toHaveAttribute('id', 'associated-toggle');
  });

  it('supports unchecked state', () => {
    render(<Toggle label="Unchecked" />);

    expect(screen.getByRole('switch', { name: 'Unchecked' })).not.toBeChecked();
  });

  it('uses md as the default size', () => {
    const { container } = render(<Toggle label="Default size" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, styles.size_md);
  });

  it('supports sm size', () => {
    const { container } = render(<Toggle label="Small size" size="sm" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, styles.size_sm);
  });

  it('supports checked state', () => {
    render(<Toggle label="Checked" checked onCheckedChange={() => undefined} />);

    expect(screen.getByRole('switch', { name: 'Checked' })).toBeChecked();
  });

  it('supports uncontrolled defaultChecked state', () => {
    render(<Toggle label="Default checked" defaultChecked />);

    expect(screen.getByRole('switch', { name: 'Default checked' })).toBeChecked();
  });

  it('supports uncontrolled interaction', () => {
    render(<Toggle label="Interactive" />);

    const toggle = screen.getByRole('switch', { name: 'Interactive' });

    fireEvent.click(toggle);

    expect(toggle).toBeChecked();
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Toggle label="Controlled" checked={false} onCheckedChange={() => undefined} />);

    expect(screen.getByRole('switch', { name: 'Controlled' })).not.toBeChecked();

    rerender(<Toggle label="Controlled" checked onCheckedChange={() => undefined} />);

    expect(screen.getByRole('switch', { name: 'Controlled' })).toBeChecked();
  });

  it('calls onCheckedChange with the next checked value and event', () => {
    const handleCheckedChange = vi.fn();

    render(<Toggle label="Notify" onCheckedChange={handleCheckedChange} />);

    const toggle = screen.getByRole('switch', { name: 'Notify' });

    fireEvent.click(toggle);

    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ target: toggle }));
  });

  it('supports disabled state', () => {
    const handleCheckedChange = vi.fn();

    render(<Toggle label="Disabled" disabled onCheckedChange={handleCheckedChange} />);

    const toggle = screen.getByRole('switch', { name: 'Disabled' });

    expect(toggle).toBeDisabled();

    fireEvent.click(toggle);

    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it('supports required state', () => {
    render(<Toggle label="Required" required />);

    expect(screen.getByRole('switch', { name: /Required/ })).toBeRequired();
    expect(screen.getByText('*')).toHaveClass(styles.requiredIndicator);
  });

  it('supports custom className', () => {
    const { container } = render(<Toggle label="Custom" className="custom-toggle" />);

    expect(container.querySelector('label')).toHaveClass(styles.root, 'custom-toggle');
  });

  it('forwards native input props', () => {
    render(<Toggle label="Named" name="matter" value="enabled" data-testid="matter-toggle" />);

    const toggle = screen.getByTestId('matter-toggle');

    expect(toggle).toHaveAttribute('name', 'matter');
    expect(toggle).toHaveAttribute('value', 'enabled');
  });

  it('supports aria-label when label is omitted', () => {
    render(<Toggle aria-label="Enable current row" />);

    expect(screen.getByRole('switch', { name: 'Enable current row' })).toBeInTheDocument();
  });

  it('keeps the native input focusable for keyboard users', () => {
    render(<Toggle label="Keyboard" />);

    const toggle = screen.getByRole('switch', { name: 'Keyboard' });

    toggle.focus();

    expect(toggle).toHaveFocus();
    expect(toggle).toHaveClass(focusRingClassNames.focusRing, focusRingClassNames.focusRingDefault);
  });

  it('renders private decorative indicator parts without shared icons', () => {
    const { container } = render(<Toggle label="Decorative indicator" />);
    const indicator = container.querySelector(`.${styles.indicator}`);

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
