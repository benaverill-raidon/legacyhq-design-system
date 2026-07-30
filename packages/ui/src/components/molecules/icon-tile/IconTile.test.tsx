// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { CheckIcon } from '../../../assets/icons';
import { IconTile } from './icon-tile';

const iconTileCss = readFileSync(
  'packages/ui/src/components/molecules/icon-tile/icon-tile.module.css',
  'utf8',
);

afterEach(cleanup);

describe('IconTile', () => {
  it('renders its icon child', () => {
    render(
      <IconTile decorative={false} ariaLabel="Verified">
        <CheckIcon testId="check-icon" />
      </IconTile>,
    );

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('uses the default tone, appearance, shape, and size', () => {
    render(
      <IconTile decorative={false} ariaLabel="Default">
        <CheckIcon />
      </IconTile>,
    );

    const tile = screen.getByRole('img', { name: 'Default' });
    expect(tile).toHaveAttribute('data-tone', 'brand');
    expect(tile).toHaveAttribute('data-appearance', 'default');
    expect(tile).toHaveAttribute('data-shape', 'square');
    expect(tile).toHaveAttribute('data-size', 'md');
  });

  it('applies a selected tone', () => {
    render(
      <IconTile tone="teal" decorative={false} ariaLabel="Teal">
        <CheckIcon />
      </IconTile>,
    );

    expect(screen.getByRole('img', { name: 'Teal' })).toHaveAttribute('data-tone', 'teal');
  });

  it('applies a selected appearance', () => {
    render(
      <IconTile appearance="bold" decorative={false} ariaLabel="Bold">
        <CheckIcon />
      </IconTile>,
    );

    expect(screen.getByRole('img', { name: 'Bold' })).toHaveAttribute('data-appearance', 'bold');
  });

  it('applies a selected shape', () => {
    render(
      <IconTile shape="round" decorative={false} ariaLabel="Round">
        <CheckIcon />
      </IconTile>,
    );

    expect(screen.getByRole('img', { name: 'Round' })).toHaveAttribute('data-shape', 'round');
  });

  it('applies a selected size', () => {
    render(
      <IconTile size="lg" decorative={false} ariaLabel="Large">
        <CheckIcon />
      </IconTile>,
    );

    expect(screen.getByRole('img', { name: 'Large' })).toHaveAttribute('data-size', 'lg');
  });

  it('is decorative and hidden from the accessibility tree by default', () => {
    render(
      <IconTile>
        <CheckIcon testId="decorative-icon" />
      </IconTile>,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('decorative-icon').closest('[aria-hidden]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('exposes role img and ariaLabel when not decorative', () => {
    render(
      <IconTile decorative={false} ariaLabel="1 unread notification">
        <CheckIcon />
      </IconTile>,
    );

    expect(screen.getByRole('img', { name: '1 unread notification' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(
      <IconTile className="custom-icon-tile" decorative={false} ariaLabel="Custom">
        <CheckIcon />
      </IconTile>,
    );

    expect(screen.getByRole('img', { name: 'Custom' })).toHaveClass('custom-icon-tile');
  });

  it('uses semantic size tokens for the container', () => {
    expect(iconTileCss).toContain('--icon-tile-size: var(--size-500);');
    expect(iconTileCss).toContain('--icon-tile-size: var(--size-200);');
    expect(iconTileCss).toContain('--icon-tile-size: var(--size-600);');
  });

  it('derives icon size as two thirds of the tile size', () => {
    expect(iconTileCss).toContain('--icon-tile-icon-size: calc(var(--icon-tile-size) * 2 / 3);');
  });

  it('uses the full-round radius token for the round shape', () => {
    expect(iconTileCss).toContain('border-radius: var(--border-radius-full-round);');
  });

  it('uses semantic accent color tokens for every tone', () => {
    expect(iconTileCss).toContain('background: var(--color-background-accent-red-default-default);');
    expect(iconTileCss).toContain('background: var(--color-background-accent-red-bold-default);');
    expect(iconTileCss).toContain('background: var(--color-background-brand-primary-default-default);');
    expect(iconTileCss).toContain('color: var(--color-content-inverse);');
  });
});
