// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './toast';
import styles from './toast.module.css';

const toastCss = readFileSync('packages/ui/src/components/organisms/toast/toast.module.css', 'utf8');

afterEach(cleanup);

describe('Toast', () => {
  it('renders the title', () => {
    render(<Toast title="Saved" />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('defaults to role status', () => {
    render(<Toast title="Saved" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sets a data-appearance attribute', () => {
    render(<Toast appearance="error" title="Failed" />);

    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'error');
  });

  it('shows the description and actions only when expanded', () => {
    const { rerender } = render(
      <Toast title="Saved" description="Synced" actions={<button type="button">Undo</button>} expanded>
        {null}
      </Toast>,
    );
    expect(screen.getByText('Synced')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();

    rerender(
      <Toast title="Saved" description="Synced" actions={<button type="button">Undo</button>} expanded={false}>
        {null}
      </Toast>,
    );
    expect(screen.queryByText('Synced')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('renders a status tile for a non-loading appearance', () => {
    const { container } = render(<Toast appearance="success" title="Saved" />);

    expect(container.querySelector('[data-tone="green"]')).toBeInTheDocument();
    expect(container.querySelector(`.${styles.spinnerSlot}`)).not.toBeInTheDocument();
  });

  it('renders a spinner for the loading appearance', () => {
    const { container } = render(<Toast appearance="loading" title="Uploading" />);

    expect(container.querySelector(`.${styles.spinnerSlot}`)).toBeInTheDocument();
    expect(container.querySelector('[data-tone]')).not.toBeInTheDocument();
  });

  it('shows a dismiss button by default and calls onDismiss', () => {
    const onDismiss = vi.fn();

    render(<Toast title="Saved" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('omits the dismiss button when isDismissible is false', () => {
    render(<Toast title="Uploading" isDismissible={false} />);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Toast ref={ref} title="Saved" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Toast CSS contract', () => {
  it('renders on a raised surface with a radius-xl corner and a 1px border', () => {
    expect(toastCss).toMatch(/\.root \{[\s\S]*?background: var\(--color-elevation-surface-raised-default\);/);
    expect(toastCss).toContain('border-radius: var(--border-radius-xl);');
    expect(toastCss).toContain('border: var(--border-width-sm) solid var(--color-border-default);');
  });

  it('applies the overlay elevation shadow', () => {
    expect(toastCss).toContain('box-shadow: var(--elevation-shadow-overlay);');
  });

  it('colors the loading appearance with the loading content token', () => {
    expect(toastCss).toMatch(/\.spinnerSlot \{[\s\S]*?color: var\(--color-content-loading\);/);
    expect(toastCss).toMatch(/\.root\[data-appearance='loading'\] \.title \{[\s\S]*?color: var\(--color-content-loading\);/);
  });

  it('announces the status before the title, except for default and loading', () => {
    const { rerender } = render(<Toast appearance="error" title="Upload failed" isDismissible={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Error: Upload failed');
    expect(screen.getByText('Error:')).toHaveClass(styles.visuallyHidden);

    rerender(<Toast appearance="info" title="New version" isDismissible={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Information: New version');

    rerender(<Toast appearance="success" statusLabel="Listo" title="Saved" isDismissible={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Listo: Saved');

    for (const appearance of ['default', 'loading'] as const) {
      rerender(<Toast appearance={appearance} title="Saving" isDismissible={false} />);
      expect(screen.getByRole('status')).not.toHaveTextContent(/:/);
    }
  });

  it('names the dismiss button with an overridable label', () => {
    render(<Toast title="Saved" dismissLabel="Cerrar" />);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });
});
