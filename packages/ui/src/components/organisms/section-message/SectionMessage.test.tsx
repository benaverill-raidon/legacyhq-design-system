// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link } from '../../atoms/link';
import { SectionMessage } from './section-message';
import styles from './section-message.module.css';
import type { SectionMessageAppearance } from './section-message.types';

const sectionMessageCss = readFileSync(
  'packages/ui/src/components/organisms/section-message/section-message.module.css',
  'utf8',
);

afterEach(cleanup);

describe('SectionMessage', () => {
  it('renders the description', () => {
    render(<SectionMessage>Restricted access</SectionMessage>);

    expect(screen.getByText('Restricted access')).toBeInTheDocument();
  });

  it('renders the title when provided and omits it otherwise', () => {
    const { rerender } = render(<SectionMessage title="Heads up">Body</SectionMessage>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();

    rerender(<SectionMessage>Body only</SectionMessage>);
    expect(screen.queryByText('Heads up')).not.toBeInTheDocument();
  });

  it('defaults to role status and the information appearance', () => {
    render(<SectionMessage>Body</SectionMessage>);

    const root = screen.getByRole('status');

    expect(root).toHaveClass(styles.root, styles.appearance_information);
  });

  it('applies the appearance class', () => {
    const appearances: SectionMessageAppearance[] = ['information', 'success', 'warning', 'error'];

    appearances.forEach((appearance) => {
      const { unmount } = render(<SectionMessage appearance={appearance}>{appearance}</SectionMessage>);

      expect(screen.getByText(appearance).closest(`.${styles.root}`)).toHaveClass(styles[`appearance_${appearance}`]);

      unmount();
    });
  });

  it('renders a status icon', () => {
    const { container } = render(<SectionMessage appearance="error">Body</SectionMessage>);

    expect(container.querySelector('[data-color]')).toBeInTheDocument();
  });

  it('allows the role to be overridden', () => {
    render(
      <SectionMessage appearance="error" role="alert">
        Payment failed
      </SectionMessage>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the actions passed to it as-is, with no injected separators', () => {
    const { container } = render(
      <SectionMessage
        actions={
          <>
            <Link href="#a">First</Link>
            <Link href="#b">Second</Link>
          </>
        }
      >
        Body
      </SectionMessage>,
    );

    const actions = container.querySelector(`.${styles.actions}`);
    expect(actions).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Second' })).toBeInTheDocument();
    // The decorative middot separator is gone - actions are laid out by a ButtonGroup instead.
    expect(actions?.textContent).not.toContain('·');
  });

  it('omits the actions region when no actions are provided', () => {
    const { container } = render(<SectionMessage>Body</SectionMessage>);

    expect(container.querySelector(`.${styles.actions}`)).not.toBeInTheDocument();
  });

  it('is not dismissible by default', () => {
    render(<SectionMessage>Body</SectionMessage>);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('dismisses itself and calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();

    render(
      <SectionMessage isDismissible onDismiss={onDismiss}>
        Dismiss me
      </SectionMessage>,
    );

    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('composes a custom className and forwards other props', () => {
    render(
      <SectionMessage className="custom-sm" data-testid="sm">
        Body
      </SectionMessage>,
    );

    expect(screen.getByTestId('sm')).toHaveClass(styles.root, 'custom-sm');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<SectionMessage ref={ref}>Body</SectionMessage>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('SectionMessage CSS contract', () => {
  it('maps each appearance to its subtle background and border token', () => {
    expect(sectionMessageCss).toMatch(/\.appearance_information \{[\s\S]*?border-color: var\(--color-border-information\);[\s\S]*?background: var\(--color-background-information-subtle-default\);/);
    expect(sectionMessageCss).toMatch(/\.appearance_success \{[\s\S]*?border-color: var\(--color-border-success\);[\s\S]*?background: var\(--color-background-success-subtle-default\);/);
    expect(sectionMessageCss).toMatch(/\.appearance_warning \{[\s\S]*?border-color: var\(--color-border-warning\);[\s\S]*?background: var\(--color-background-warning-subtle-default\);/);
    expect(sectionMessageCss).toMatch(/\.appearance_error \{[\s\S]*?border-color: var\(--color-border-error\);[\s\S]*?background: var\(--color-background-error-subtle-default\);/);
  });

  it('uses the Figma layout tokens (radius-xl, 1px border, spacing-lg padding)', () => {
    expect(sectionMessageCss).toContain('border-radius: var(--border-radius-xl);');
    expect(sectionMessageCss).toContain('border: var(--border-width-sm) solid transparent;');
    expect(sectionMessageCss).toContain('padding: var(--spacing-lg);');
  });
});
