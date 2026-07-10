import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArrowRightIcon, CheckIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { LinkButton, getLinkButtonRel } from './link-button';
import styles from './link-button.module.css';

afterEach(cleanup);

describe('LinkButton', () => {
  it('renders a native anchor', () => {
    render(<LinkButton href="/clients">Clients</LinkButton>);

    const link = screen.getByRole('link', { name: 'Clients' });

    expect(link.tagName).toBe('A');
  });

  it('applies href', () => {
    render(<LinkButton href="/clients">Clients</LinkButton>);

    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('href', '/clients');
  });

  it('supports target', () => {
    render(
      <LinkButton href="https://example.com" target="_blank">
        External
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('target', '_blank');
  });

  it('auto-adds noopener noreferrer for target blank when rel is absent', () => {
    render(
      <LinkButton href="https://example.com" target="_blank">
        External
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves provided rel', () => {
    render(
      <LinkButton href="https://example.com" target="_blank" rel="nofollow">
        External
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('rel', 'nofollow');
  });

  it('renders children', () => {
    render(<LinkButton href="/clients">Open client</LinkButton>);

    expect(screen.getByRole('link', { name: 'Open client' })).toHaveTextContent('Open client');
  });

  it('renders iconBefore and iconAfter', () => {
    render(
      <LinkButton
        href="/clients"
        iconBefore={
          <span data-testid="before">
            <CheckIcon />
          </span>
        }
        iconAfter={
          <span data-testid="after">
            <ArrowRightIcon />
          </span>
        }
      >
        Open client
      </LinkButton>,
    );

    expect(screen.getByTestId('before')).toBeInTheDocument();
    expect(screen.getByTestId('after')).toBeInTheDocument();
  });

  it('loading renders spinner and sets aria-busy', () => {
    const { container } = render(
      <LinkButton href="/clients" isLoading>
        Open client
      </LinkButton>,
    );

    const link = screen.getByRole('link', { name: 'Open client' });

    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector(`.${styles.spinner}`)).toBeInTheDocument();
  });

  it('loading prevents click and navigation', () => {
    const handleClick = vi.fn();

    render(
      <LinkButton href="/clients" isLoading onClick={handleClick}>
        Open client
      </LinkButton>,
    );

    const link = screen.getByRole('link', { name: 'Open client' });

    fireEvent.click(link);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled sets aria-disabled and tabIndex -1', () => {
    render(
      <LinkButton href="/clients" isDisabled>
        Open client
      </LinkButton>,
    );

    const link = screen.getByRole('link', { name: 'Open client' });

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('disabled prevents click and navigation', () => {
    const handleClick = vi.fn();

    render(
      <LinkButton href="/clients" isDisabled onClick={handleClick}>
        Open client
      </LinkButton>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Open client' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies size classes', () => {
    const { rerender } = render(
      <LinkButton href="/clients" size="xs">
        XS
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'XS' })).toHaveClass(styles.size_xs);

    rerender(
      <LinkButton href="/clients" size="lg">
        LG
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'LG' })).toHaveClass(styles.size_lg);
  });

  it('applies appearance and tone classes', () => {
    const { rerender } = render(
      <LinkButton href="/clients" appearance="default" tone="neutral">
        Default
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'Default' })).toHaveClass(styles.appearance_default, styles.tone_neutral);

    rerender(
      <LinkButton href="/clients" appearance="primary" tone="warning">
        Warning
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'Warning' })).toHaveClass(styles.appearance_primary, styles.tone_warning);
  });

  it('supports custom className', () => {
    render(
      <LinkButton href="/clients" className="custom-link-button" data-testid="link-button">
        Clients
      </LinkButton>,
    );

    expect(screen.getByTestId('link-button')).toHaveClass(styles.linkButton, 'custom-link-button');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLAnchorElement>();

    render(
      <LinkButton href="/clients" ref={ref}>
        Clients
      </LinkButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('uses shared focus ring classes', () => {
    render(<LinkButton href="/clients">Clients</LinkButton>);

    expect(screen.getByRole('link', { name: 'Clients' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });
});

describe('getLinkButtonRel', () => {
  it('returns secure rel for blank target without rel', () => {
    expect(getLinkButtonRel('_blank', undefined)).toBe('noopener noreferrer');
  });

  it('preserves provided rel', () => {
    expect(getLinkButtonRel('_blank', 'nofollow')).toBe('nofollow');
  });

  it('leaves non-blank rel untouched', () => {
    expect(getLinkButtonRel('_self', undefined)).toBeUndefined();
  });
});
