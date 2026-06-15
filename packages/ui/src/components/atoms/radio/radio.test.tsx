import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio } from './radio';
import styles from './radio.module.css';

afterEach(cleanup);

describe('Radio', () => {
  it('renders a native radio input', () => {
    render(<Radio aria-label="Select row" name="row" value="one" />);

    expect(screen.getByRole('radio', { name: 'Select row' })).toBeInTheDocument();
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

  it('renders a private decorative indicator without svg control icons', () => {
    const { container } = render(<Radio label="Decorative indicator" name="decorative" value="decorative" />);
    const indicator = container.querySelector(`.${styles.indicator}`);

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('does not add a manual radio role', () => {
    render(<Radio label="Native" name="native" value="native" />);

    expect(screen.getByRole('radio', { name: 'Native' }).tagName).toBe('INPUT');
  });
});
