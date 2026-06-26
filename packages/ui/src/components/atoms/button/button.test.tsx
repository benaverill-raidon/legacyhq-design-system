// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Button } from './button';
import styles from './button.module.css';
import type { ButtonAppearance, ButtonSize, ButtonTone } from './button.types';

const buttonCss = readFileSync('packages/ui/src/components/atoms/button/button.module.css', 'utf8');

afterEach(cleanup);

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Save changes</Button>);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('defaults to type button', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('supports custom button type', () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit');
  });

  it('supports size variants', () => {
    const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg'];

    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>{size}</Button>);

      expect(screen.getByRole('button', { name: size })).toHaveClass(styles[`size_${size}`]);

      unmount();
    });
  });

  it('supports appearance variants', () => {
    const appearances: ButtonAppearance[] = ['default', 'primary', 'subtle'];

    appearances.forEach((appearance) => {
      const { unmount } = render(<Button appearance={appearance}>{appearance}</Button>);

      expect(screen.getByRole('button', { name: appearance })).toHaveClass(styles[`appearance_${appearance}`]);

      unmount();
    });
  });

  it('supports tone variants', () => {
    const tones: ButtonTone[] = ['neutral', 'warning', 'error', 'discovery'];

    tones.forEach((tone) => {
      const { unmount } = render(<Button tone={tone}>{tone}</Button>);

      expect(screen.getByRole('button', { name: tone })).toHaveClass(styles[`tone_${tone}`]);

      unmount();
    });
  });

  it('supports disabled behavior', () => {
    const handleClick = vi.fn();

    render(
      <Button isDisabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Disabled' });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled behavior to primary semantic tone buttons', () => {
    render(
      <Button appearance="primary" tone="error" isDisabled>
        Delete
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });

    expect(button).toBeDisabled();
    expect(button).toHaveClass(styles.appearance_primary, styles.tone_error);
  });

  it('supports loading behavior', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Button isLoading onClick={handleClick}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Save changes')).toBeVisible();
    expect(container.querySelector(`.${styles.spinner}`)).toBeInTheDocument();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports full width behavior', () => {
    render(<Button isFullWidth>Continue</Button>);

    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass(styles.fullWidth);
  });

  it('renders iconBefore and iconAfter', () => {
    render(
      <Button
        iconBefore={
          <span data-testid="before">
            <CheckIcon />
          </span>
        }
        iconAfter={
          <span data-testid="after">
            <CheckIcon />
          </span>
        }
      >
        Confirm
      </Button>,
    );

    expect(screen.getByTestId('before')).toBeInTheDocument();
    expect(screen.getByTestId('after')).toBeInTheDocument();
  });

  it('supports custom className and native props', () => {
    render(
      <Button className="custom-button" name="saveAction" value="save" data-testid="save-button">
        Save
      </Button>,
    );

    const button = screen.getByTestId('save-button');

    expect(button).toHaveClass(styles.button, 'custom-button');
    expect(button).toHaveAttribute('name', 'saveAction');
    expect(button).toHaveAttribute('value', 'save');
  });

  it('calls onClick when enabled', () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses the shared focus ring classes', () => {
    render(<Button>Focusable</Button>);

    expect(screen.getByRole('button', { name: 'Focusable' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('maps button radii by size and tokenizes the focus ring offset', () => {
    expect(buttonCss).toContain('--button-border-radius: var(--border-radius-sm);');
    expect(buttonCss).toContain('--focus-ring-offset: var(--spacing-025);');
    expect(buttonCss).toMatch(/\.size_sm \{[\s\S]*?--button-border-radius: var\(--border-radius-lg\);/);
    expect(buttonCss).toMatch(/\.size_md \{[\s\S]*?--button-border-radius: var\(--border-radius-lg\);/);
    expect(buttonCss).toMatch(/\.size_lg \{[\s\S]*?--button-border-radius: var\(--border-radius-xl\);/);
    expect(buttonCss).not.toContain('border-radius: 10px;');
    expect(buttonCss).not.toContain('border-radius: 12px;');
    expect(buttonCss).not.toContain('border-radius: 14px;');
  });
});
