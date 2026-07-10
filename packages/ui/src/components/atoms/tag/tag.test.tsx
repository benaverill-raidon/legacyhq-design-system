// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetsIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Tag, getTagRel, getTagRemoveLabel } from './tag';
import styles from './tag.module.css';

afterEach(cleanup);

const tagCss = readFileSync('packages/ui/src/components/atoms/tag/tag.module.css', 'utf8');

describe('Tag', () => {
  it('renders a display-only span when no href is provided', () => {
    render(<Tag>Estate plan</Tag>);

    const tag = screen.getByText('Estate plan');

    expect(tag.tagName).toBe('SPAN');
    expect(tag.closest('a')).toBeNull();
  });

  it('renders an anchor when href is provided and not removable', () => {
    render(<Tag href="/trusts/123">Trust</Tag>);

    const link = screen.getByRole('link', { name: 'Trust' });

    expect(link.tagName).toBe('A');
  });

  it('renders a wrapper with anchor and remove button when href and isRemovable are provided', () => {
    render(
      <Tag href="/trusts/123" isRemovable onRemove={() => undefined}>
        Trust
      </Tag>,
    );

    expect(screen.getByRole('link', { name: 'Trust' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Trust' })).toBeInTheDocument();
  });

  it('does not nest the remove button inside the anchor', () => {
    render(
      <Tag href="/trusts/123" isRemovable onRemove={() => undefined}>
        Trust
      </Tag>,
    );

    const link = screen.getByRole('link', { name: 'Trust' });
    const button = screen.getByRole('button', { name: 'Remove Trust' });

    expect(link.contains(button)).toBe(false);
  });

  it('applies href', () => {
    render(<Tag href="/trusts/123">Trust</Tag>);

    expect(screen.getByRole('link', { name: 'Trust' })).toHaveAttribute('href', '/trusts/123');
  });

  it('supports target', () => {
    render(
      <Tag href="https://example.com" target="_blank">
        External
      </Tag>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('target', '_blank');
  });

  it('adds secure rel for target blank when rel is absent', () => {
    render(
      <Tag href="https://example.com" target="_blank">
        External
      </Tag>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves provided rel', () => {
    render(
      <Tag href="https://example.com" target="_blank" rel="nofollow">
        External
      </Tag>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('rel', 'nofollow');
  });

  it('renders elemBefore', () => {
    render(
      <Tag elemBefore={<span data-testid="elem-before"><AssetsIcon size="sm" /></span>}>
        Asset
      </Tag>,
    );

    expect(screen.getByTestId('elem-before')).toBeInTheDocument();
  });

  it('renders remove button when removable', () => {
    render(
      <Tag isRemovable onRemove={() => undefined}>
        Remove me
      </Tag>,
    );

    expect(screen.getByRole('button', { name: 'Remove Remove me' })).toBeInTheDocument();
  });

  it('remove button calls onRemove', () => {
    const handleRemove = vi.fn();

    render(
      <Tag isRemovable onRemove={handleRemove}>
        Remove me
      </Tag>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Remove me' }));

    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('disabled remove prevents remove callback', () => {
    const handleRemove = vi.fn();

    render(
      <Tag isRemovable isDisabled onRemove={handleRemove}>
        Remove me
      </Tag>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Remove me' }));

    expect(handleRemove).not.toHaveBeenCalled();
  });

  it('remove button does not trigger navigation or the anchor click handler', () => {
    const handleClick = vi.fn();
    const handleRemove = vi.fn();

    render(
      <Tag href="/trusts/123" isRemovable onClick={handleClick} onRemove={handleRemove}>
        Trust
      </Tag>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Trust' }));

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled prevents navigation', () => {
    const handleClick = vi.fn();

    render(
      <Tag href="/trusts/123" isDisabled onClick={handleClick}>
        Trust
      </Tag>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Trust' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled disables remove button', () => {
    render(
      <Tag isRemovable isDisabled onRemove={() => undefined}>
        Trust
      </Tag>,
    );

    expect(screen.getByRole('button', { name: 'Remove Trust' })).toBeDisabled();
  });

  it('sets aria-disabled for disabled navigational content', () => {
    render(
      <Tag href="/trusts/123" isDisabled>
        Trust
      </Tag>,
    );

    expect(screen.getByRole('link', { name: 'Trust' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets tabIndex -1 for disabled navigational content', () => {
    render(
      <Tag href="/trusts/123" isDisabled>
        Trust
      </Tag>,
    );

    expect(screen.getByRole('link', { name: 'Trust' })).toHaveAttribute('tabindex', '-1');
  });

  it('applies tone class', () => {
    render(<Tag tone="green" data-testid="tag">Trust</Tag>);

    expect(screen.getByTestId('tag')).toHaveClass(styles.tone_green);
  });

  it('supports brand tone', () => {
    render(<Tag tone="brand" data-testid="tag">Trust</Tag>);

    expect(screen.getByTestId('tag')).toHaveClass(styles.tone_brand);
  });

  it('applies size class', () => {
    render(<Tag size="sm" data-testid="tag">Trust</Tag>);

    expect(screen.getByTestId('tag')).toHaveClass(styles.size_sm);
  });

  it('supports custom className', () => {
    render(
      <Tag className="custom-tag" data-testid="tag">
        Trust
      </Tag>,
    );

    expect(screen.getByTestId('tag')).toHaveClass(styles.root, 'custom-tag');
  });

  it('forwards refs to the rendered root element', () => {
    const ref = React.createRef<HTMLElement>();

    render(<Tag ref={ref}>Trust</Tag>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('uses the shared focus ring classes for navigational content', () => {
    render(<Tag href="/trusts/123">Trust</Tag>);

    expect(screen.getByRole('link', { name: 'Trust' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('uses the shared focus ring classes for the removable action', () => {
    render(
      <Tag isRemovable onRemove={() => undefined}>
        Trust
      </Tag>,
    );

    expect(screen.getByRole('button', { name: 'Remove Trust' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });
});

describe('tag helpers', () => {
  it('adds secure rel for target blank when needed', () => {
    expect(getTagRel('_blank', undefined)).toBe('noopener noreferrer');
  });

  it('preserves provided rel values', () => {
    expect(getTagRel('_blank', 'nofollow')).toBe('nofollow');
  });

  it('derives remove label from string children', () => {
    expect(getTagRemoveLabel(undefined, 'Trust')).toBe('Remove Trust');
  });

  it('falls back to a generic remove label when children are not plain text', () => {
    expect(getTagRemoveLabel(undefined, <span>Trust</span>)).toBe('Remove tag');
  });
});

describe('tag CSS contract', () => {
  it('maps standard and accent tones to semantic Figma-backed tokens', () => {
    expect(tagCss).toContain('--tag-background: var(--color-background-input-default);');
    expect(tagCss).toContain('--tag-border: var(--color-border-bold);');
    expect(tagCss).toContain('--tag-color: var(--color-content-default);');
    expect(tagCss).toContain('--tag-background-hovered: var(--color-background-neutral-subtle-hovered);');
    expect(tagCss).toContain('--tag-background: var(--color-background-accent-blue-subtlest-default);');
    expect(tagCss).toContain('--tag-border: var(--color-border-accent-blue);');
    expect(tagCss).toContain('--tag-color: var(--color-content-accent-blue-bolder);');
    expect(tagCss).toContain('--tag-background: var(--color-background-brand-subtle-default);');
    expect(tagCss).toContain('--tag-border: var(--color-border-brand);');
    expect(tagCss).toContain('--tag-color: var(--color-content-brand);');
  });

  it('resets link styling so anchors inherit tag presentation', () => {
    expect(tagCss).toContain('.contentInteractive {');
    expect(tagCss).toContain('color: inherit;');
    expect(tagCss).toContain('text-decoration: none;');
    expect(tagCss).toContain('.contentInteractive:visited {');
  });

  it('resets remove button styling so it does not rely on browser defaults', () => {
    expect(tagCss).toContain('appearance: none;');
    expect(tagCss).toContain('-webkit-appearance: none;');
    expect(tagCss).toContain('margin: 0;');
    expect(tagCss).toContain('border: 0;');
    expect(tagCss).toContain('font: inherit;');
    expect(tagCss).toContain('background-color: var(--tag-background);');
    expect(tagCss).toContain('position: relative;');
  });

  it('keeps icon and remove icon color inheritance token-driven', () => {
    expect(tagCss).toContain('.root :global([data-color]) {');
    expect(tagCss).toContain('color: inherit;');
    expect(tagCss).toContain('.elemBefore :global([data-size]),');
    expect(tagCss).toContain('.removeIcon :global([data-size]) {');
  });

  it('uses Tag-specific anatomy tokens for sizing and semantic tokens for spacing and radius', () => {
    expect(tagCss).toContain('--tag-min-height: var(--component-tag-min-height-md);');
    expect(tagCss).toContain('--tag-remove-size: var(--component-tag-remove-size-md);');
    expect(tagCss).toContain('--tag-icon-size: var(--component-tag-icon-size-md);');
    expect(tagCss).toContain('--tag-min-height: var(--component-tag-min-height-sm);');
    expect(tagCss).toContain('--tag-remove-size: var(--component-tag-remove-size-sm);');
    expect(tagCss).toContain('--tag-icon-size: var(--component-tag-icon-size-sm);');
    expect(tagCss).toContain('--tag-gap: var(--spacing-050);');
    expect(tagCss).toContain('border-start-end-radius: 0;');
    expect(tagCss).toContain('border-end-end-radius: 0;');
    expect(tagCss).toContain('border-start-start-radius: 0;');
    expect(tagCss).toContain('border-end-start-radius: 0;');
    expect(tagCss).toContain('--tag-radius: var(--border-radius-sm);');
    expect(tagCss).toContain('--tag-radius: var(--border-radius-lg);');
    expect(tagCss).not.toContain('component-button-min-height');
    expect(tagCss).toContain('font-family: var(--typography-body-md-font-family);');
    expect(tagCss).not.toContain('--tag-surface');
    expect(tagCss).not.toContain('--tag-overlay');
  });
});




