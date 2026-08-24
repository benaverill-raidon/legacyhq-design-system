// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Switch } from './switch';
import styles from './switch.module.css';

const switchCss = readFileSync('packages/ui/src/components/atoms/switch/switch.module.css', 'utf8');
const tokensCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');

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

  it('supports loading state - blocks toggling but stays focusable, unlike disabled', () => {
    const handleCheckedChange = vi.fn();

    render(<Switch label="Saving" isLoading onCheckedChange={handleCheckedChange} />);

    const switchInput = screen.getByRole('switch', { name: 'Saving' });

    expect(switchInput).not.toBeDisabled();
    expect(switchInput).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(switchInput);

    expect(switchInput).not.toBeChecked();
    expect(handleCheckedChange).not.toHaveBeenCalled();

    switchInput.focus();
    expect(switchInput).toHaveFocus();
  });

  it('calls a consumer onClick only when not loading', () => {
    const handleClick = vi.fn();
    const { rerender } = render(<Switch label="Notify" isLoading onClick={handleClick} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Notify' }));
    expect(handleClick).not.toHaveBeenCalled();

    rerender(<Switch label="Notify" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Notify' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('replaces the on/off mark with a loading Spinner in the same slot, not on the thumb', () => {
    const { container } = render(<Switch label="Saving" isLoading defaultChecked />);

    const iconOn = container.querySelector(`.${styles.iconOn}`);
    const iconOff = container.querySelector(`.${styles.iconOff}`);
    const thumb = container.querySelector(`.${styles.thumb}`);

    expect(iconOn?.querySelector('svg')).toBeInTheDocument();
    expect(iconOff?.querySelector('svg')).toBeInTheDocument();
    expect(thumb?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('inherits the on/off mark color for the loading Spinner - no color override of its own', () => {
    // The indicator sets color: var(--color-content-inverse) for the check/X marks via
    // currentColor; the Spinner slots into the same .icon element so it inherits that directly.
    expect(switchCss).toMatch(/\.icon \{[\s\S]*?color: var\(--color-content-inverse\);/);

    const thumbBlockMatch = switchCss.match(/\.thumb \{[\s\S]*?\n\}/);
    expect(thumbBlockMatch?.[0]).not.toContain('color:');
  });

  it('hides the CSS-drawn check/X marks while loading, so only the Spinner shows', () => {
    expect(switchCss).toContain("[data-loading='true'] .iconOn::before");
    expect(switchCss).toContain("[data-loading='true'] .iconOff::before");
    expect(switchCss).toContain("[data-loading='true'] .iconOff::after");
  });

  it('shows icons by default', () => {
    const { container } = render(<Switch label="Default icons" />);

    expect(container.querySelector('label')).not.toHaveAttribute('data-hide-icons');
  });

  it('hides the CSS-drawn check/X marks when showIcons is false', () => {
    const { container } = render(<Switch label="No icons" showIcons={false} />);

    expect(container.querySelector('label')).toHaveAttribute('data-hide-icons', 'true');
    expect(switchCss).toContain("[data-hide-icons='true'] .iconOn::before");
    expect(switchCss).toContain("[data-hide-icons='true'] .iconOff::before");
    expect(switchCss).toContain("[data-hide-icons='true'] .iconOff::after");
  });

  it('still renders the loading Spinner when showIcons is false', () => {
    const { container } = render(<Switch label="Loading, no icons" isLoading showIcons={false} />);

    const iconOn = container.querySelector(`.${styles.iconOn}`);
    const iconOff = container.querySelector(`.${styles.iconOff}`);

    expect(iconOn?.querySelector('svg')).toBeInTheDocument();
    expect(iconOff?.querySelector('svg')).toBeInTheDocument();
  });

  it('suppresses the hover/press track treatment while loading, matching disabled', () => {
    expect(switchCss).toContain(
      ".root:not([data-disabled='true']):not([data-loading='true']):is(:hover, [data-force-state='hover']) .indicator",
    );
    expect(switchCss).toContain(
      ".root:not([data-disabled='true']):not([data-loading='true']):is(:active, [data-force-state='press']) .indicator",
    );
    expect(switchCss).toContain("cursor: progress;");
  });

  it('expands the thumb on hover as well as press, not press alone', () => {
    expect(switchCss).toMatch(
      /:is\(\s*:hover,\s*:active,\s*\[data-force-state='hover'\],\s*\[data-force-state='press'\]\s*\)\s*\.thumb\s*\{\s*transform: scaleX\(1\.16\);/,
    );
    expect(switchCss).toMatch(
      /:is\(\s*:hover,\s*:active,\s*\[data-force-state='hover'\],\s*\[data-force-state='press'\]\s*\)\s*\.input:checked \+ \.indicator \.thumb\s*\{\s*transform: translateX\(var\(--switch-thumb-translate-x\)\) scaleX\(1\.16\);/,
    );
  });

  it('supports pinning hover/press as a static Storybook reference via data-force-state', () => {
    expect(switchCss).toContain("[data-force-state='hover']");
    expect(switchCss).toContain("[data-force-state='press']");
  });

  it('forwards data-force-state to the root label, not just the input', () => {
    const { container } = render(<Switch label="Preview" data-force-state="hover" />);

    expect(container.querySelector('label')).toHaveAttribute('data-force-state', 'hover');
    expect(screen.getByRole('switch', { name: 'Preview' })).toHaveAttribute('data-force-state', 'hover');
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
  it('maps Switch anatomy and state colors to the current Figma tokens', () => {
    expect(switchCss).toMatch(
      /\.size_md \{[\s\S]*?--switch-track-width: var\(--component-switch-md-track-width\);[\s\S]*?--switch-track-height: var\(--component-switch-md-track-height\);[\s\S]*?--switch-thumb-size: var\(--component-switch-md-thumb-size\);[\s\S]*?--switch-thumb-offset: var\(--component-switch-md-thumb-inset\);[\s\S]*?--switch-thumb-translate-x: var\(--component-switch-md-thumb-translation\);/,
    );
    expect(switchCss).toMatch(
      /\.size_sm \{[\s\S]*?--switch-track-width: var\(--component-switch-sm-track-width\);[\s\S]*?--switch-track-height: var\(--component-switch-sm-track-height\);[\s\S]*?--switch-thumb-size: var\(--component-switch-sm-thumb-size\);[\s\S]*?--switch-thumb-offset: var\(--component-switch-sm-thumb-inset\);[\s\S]*?--switch-thumb-translate-x: var\(--component-switch-sm-thumb-translation\);/,
    );
    expect(switchCss).toContain('--switch-icon-size: var(--size-icon-sm);');
    expect(switchCss).toContain('background: var(--color-background-neutral-bold-default);');
    expect(switchCss).toContain('background: var(--color-background-success-bold-default);');
    expect(switchCss).toContain('background: var(--color-background-disabled);');
    expect(switchCss).toContain('color: var(--color-content-inverse);');
    expect(switchCss).not.toContain(".root[data-disabled='true'] .icon");
  });

  it('positions the on/off mark 6px from the track edge at md, matching Figma', () => {
    // Regression guard: this token previously aliased --spacing-sm (8px), 2px further toward
    // center than Figma's actual 6px inset - caught by measuring the live Figma component.
    expect(tokensCss).toContain('--component-switch-md-icon-offset: var(--measurement-6);');
    expect(tokensCss).not.toContain('--component-switch-md-icon-offset: var(--spacing-sm);');
  });
});


