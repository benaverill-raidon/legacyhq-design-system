// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Banner } from './banner';
import styles from './banner.module.css';
import type { BannerAppearance } from './banner.types';

const bannerCss = readFileSync('packages/ui/src/components/organisms/banner/banner.module.css', 'utf8');

afterEach(cleanup);

describe('Banner', () => {
  it('renders the message', () => {
    render(<Banner>Scheduled maintenance tonight</Banner>);

    expect(screen.getByText('Scheduled maintenance tonight')).toBeInTheDocument();
  });

  it('defaults to role status and the default appearance', () => {
    render(<Banner>Heads up</Banner>);

    const banner = screen.getByRole('status');

    expect(banner).toHaveClass(styles.banner, styles.appearance_default);
  });

  it('allows the role to be overridden (e.g. alert for urgent errors)', () => {
    render(
      <Banner appearance="error" role="alert">
        Payment failed
      </Banner>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies the appearance class', () => {
    const appearances: BannerAppearance[] = ['default', 'warning', 'error'];

    appearances.forEach((appearance) => {
      const { unmount } = render(<Banner appearance={appearance}>{appearance}</Banner>);

      expect(screen.getByText(appearance)).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass(styles[`appearance_${appearance}`]);

      unmount();
    });
  });

  it('renders a status icon for warning and error, and a dot for default', () => {
    const { container: defaultAppearance } = render(<Banner appearance="default">Default</Banner>);
    expect(defaultAppearance.querySelector(`.${styles.dot}`)).toBeInTheDocument();
    expect(defaultAppearance.querySelector('[data-color]')).not.toBeInTheDocument();

    const { container: warning } = render(<Banner appearance="warning">Warning</Banner>);
    expect(warning.querySelector('[data-color]')).toBeInTheDocument();
    expect(warning.querySelector(`.${styles.dot}`)).not.toBeInTheDocument();

    const { container: error } = render(<Banner appearance="error">Error</Banner>);
    expect(error.querySelector('[data-color]')).toBeInTheDocument();
  });

  it('hides the icon when showIcon is false', () => {
    const { container } = render(
      <Banner appearance="error" showIcon={false}>
        No icon
      </Banner>,
    );

    expect(container.querySelector(`.${styles.iconSlot}`)).not.toBeInTheDocument();
    expect(container.querySelector('[data-color]')).not.toBeInTheDocument();
  });

  it('marks the icon slot as decorative', () => {
    const { container } = render(<Banner appearance="warning">Warning</Banner>);

    expect(container.querySelector(`.${styles.iconSlot}`)).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders actions when provided', () => {
    render(
      <Banner actions={<button type="button">Retry</button>}>Something went wrong</Banner>,
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('omits the actions region when no actions are provided', () => {
    const { container } = render(<Banner>No actions</Banner>);

    expect(container.querySelector(`.${styles.actions}`)).not.toBeInTheDocument();
  });

  it('composes a custom className and forwards other props', () => {
    render(
      <Banner className="custom-banner" data-testid="banner">
        Custom
      </Banner>,
    );

    const banner = screen.getByTestId('banner');

    expect(banner).toHaveClass(styles.banner, 'custom-banner');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Banner ref={ref}>With ref</Banner>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Banner CSS contract', () => {
  it('maps each appearance to its bold background and content token', () => {
    expect(bannerCss).toMatch(/\.appearance_default \{[\s\S]*?background: var\(--color-background-neutral-bold-default\);[\s\S]*?color: var\(--color-content-inverse\);/);
    expect(bannerCss).toMatch(/\.appearance_warning \{[\s\S]*?background: var\(--color-background-warning-bold-default\);[\s\S]*?color: var\(--color-content-warning-bold\);/);
    expect(bannerCss).toMatch(/\.appearance_error \{[\s\S]*?background: var\(--color-background-error-bold-default\);[\s\S]*?color: var\(--color-content-inverse\);/);
  });

  it('uses the Figma spacing tokens for padding and gaps', () => {
    expect(bannerCss).toContain('padding-inline: var(--spacing-2xl);');
    expect(bannerCss).toContain('padding-block: var(--spacing-sm);');
    expect(bannerCss).toMatch(/\.message \{[\s\S]*?gap: var\(--spacing-xs\);/);
  });

  it('truncates the message to a single line', () => {
    expect(bannerCss).toMatch(/\.text \{[\s\S]*?text-overflow: ellipsis;[\s\S]*?white-space: nowrap;/);
  });

  it('lets the icon inherit the banner content color', () => {
    expect(bannerCss).toContain('.iconSlot :global([data-color]) {');
    expect(bannerCss).toMatch(/\.iconSlot :global\(\[data-color\]\) \{[\s\S]*?color: inherit;/);
  });
});
