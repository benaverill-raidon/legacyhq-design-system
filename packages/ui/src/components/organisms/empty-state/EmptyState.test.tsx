// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';
import styles from './empty-state.module.css';

const emptyStateCss = readFileSync(
  'packages/ui/src/components/organisms/empty-state/empty-state.module.css',
  'utf8',
);

afterEach(cleanup);

describe('EmptyState', () => {
  it('renders the description', () => {
    render(<EmptyState>Nothing here yet.</EmptyState>);

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('renders the heading when provided and omits it otherwise', () => {
    const { container, rerender } = render(<EmptyState heading="All caught up">Body</EmptyState>);
    expect(screen.getByText('All caught up')).toBeInTheDocument();
    expect(container.querySelector(`.${styles.heading}`)).toBeInTheDocument();

    rerender(<EmptyState>Body only</EmptyState>);
    expect(container.querySelector(`.${styles.heading}`)).not.toBeInTheDocument();
  });

  it('renders the illustration when provided and omits it otherwise', () => {
    const { container, rerender } = render(
      <EmptyState illustration={<span data-testid="art" />}>Body</EmptyState>,
    );
    expect(screen.getByTestId('art')).toBeInTheDocument();
    expect(container.querySelector(`.${styles.illustration}`)).toBeInTheDocument();

    rerender(<EmptyState>Body</EmptyState>);
    expect(container.querySelector(`.${styles.illustration}`)).not.toBeInTheDocument();
  });

  it('renders actions when provided and omits the region otherwise', () => {
    const { container, rerender } = render(
      <EmptyState actions={<button type="button">Do it</button>}>Body</EmptyState>,
    );
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
    expect(container.querySelector(`.${styles.actions}`)).toBeInTheDocument();

    rerender(<EmptyState>Body</EmptyState>);
    expect(container.querySelector(`.${styles.actions}`)).not.toBeInTheDocument();
  });

  it('defaults to the inherited (transparent) type', () => {
    const { container } = render(<EmptyState>Body</EmptyState>);

    const root = container.querySelector(`.${styles.root}`);

    expect(root).toHaveClass(styles.type_inherited);
    expect(root).not.toHaveClass(styles.type_informative);
  });

  it('applies the informative type', () => {
    const { container } = render(<EmptyState type="informative">Body</EmptyState>);

    expect(container.querySelector(`.${styles.root}`)).toHaveClass(styles.type_informative);
  });

  it('composes a custom className and forwards other props', () => {
    render(
      <EmptyState className="custom-es" data-testid="es">
        Body
      </EmptyState>,
    );

    expect(screen.getByTestId('es')).toHaveClass(styles.root, 'custom-es');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<EmptyState ref={ref}>Body</EmptyState>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('EmptyState CSS contract', () => {
  it('fills a sunken surface only for the informative type', () => {
    expect(emptyStateCss).toMatch(/\.type_informative \{[\s\S]*?background: var\(--color-elevation-surface-sunken-default\);/);
    // The base root does not paint a background (inherited stays transparent).
    const rootBlock = emptyStateCss.match(/\.root \{([^}]*)\}/)?.[1] ?? '';
    expect(rootBlock).not.toContain('background');
  });

  it('centers a vertical stack with the Figma spacing tokens', () => {
    expect(emptyStateCss).toMatch(/\.root \{[\s\S]*?flex-direction: column;[\s\S]*?align-items: center;[\s\S]*?gap: var\(--spacing-2xl\);/);
    expect(emptyStateCss).toContain('padding: var(--spacing-xl);');
    expect(emptyStateCss).toMatch(/\.message \{[\s\S]*?gap: var\(--spacing-lg\);/);
  });

  it('uses heading-md for the heading and body-md for the description', () => {
    expect(emptyStateCss).toMatch(/\.heading \{[\s\S]*?font-size: var\(--typography-heading-md-font-size\);/);
    expect(emptyStateCss).toMatch(/\.description \{[\s\S]*?font-size: var\(--typography-body-md-font-size\);/);
  });
});
