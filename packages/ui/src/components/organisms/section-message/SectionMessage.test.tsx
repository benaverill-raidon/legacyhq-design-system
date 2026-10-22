// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link } from '../../atoms/link';
import { SectionMessage } from './section-message';
import styles from './section-message.module.css';
import type { SectionMessageTone } from './section-message.types';

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

  it('defaults to role status and the information tone', () => {
    render(<SectionMessage>Body</SectionMessage>);

    const root = screen.getByRole('status');

    expect(root).toHaveClass(styles.root, styles.tone_information);
  });

  it('applies the tone class', () => {
    const tones: SectionMessageTone[] = ['information', 'success', 'warning', 'error'];

    tones.forEach((tone) => {
      const { unmount } = render(<SectionMessage tone={tone}>{tone}</SectionMessage>);

      expect(screen.getByText(tone).closest(`.${styles.root}`)).toHaveClass(styles[`tone_${tone}`]);

      unmount();
    });
  });

  it('renders a status icon', () => {
    const { container } = render(<SectionMessage tone="error">Body</SectionMessage>);

    expect(container.querySelector('[data-color]')).toBeInTheDocument();
  });

  it('allows the role to be overridden', () => {
    render(
      <SectionMessage tone="error" role="alert">
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

  it("shows the dismiss button's name as its tooltip, like every Icon Button", () => {
    vi.useFakeTimers();
    try {
      render(<SectionMessage isDismissible>Saved</SectionMessage>);

      fireEvent.pointerEnter(screen.getByRole('button', { name: 'Dismiss' }));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toHaveTextContent('Dismiss');
    } finally {
      vi.useRealTimers();
    }
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
  it('maps each tone to its subtle background and border token', () => {
    expect(sectionMessageCss).toMatch(/\.tone_information \{[\s\S]*?border-color: var\(--color-border-information\);[\s\S]*?background: var\(--color-background-information-subtle-default\);/);
    expect(sectionMessageCss).toMatch(/\.tone_success \{[\s\S]*?border-color: var\(--color-border-success\);[\s\S]*?background: var\(--color-background-success-subtle-default\);/);
    expect(sectionMessageCss).toMatch(/\.tone_warning \{[\s\S]*?border-color: var\(--color-border-warning\);[\s\S]*?background: var\(--color-background-warning-subtle-default\);/);
    expect(sectionMessageCss).toMatch(/\.tone_error \{[\s\S]*?border-color: var\(--color-border-error\);[\s\S]*?background: var\(--color-background-error-subtle-default\);/);
  });

  it('uses the Figma layout tokens (radius-xl, 1px border, spacing-lg padding)', () => {
    expect(sectionMessageCss).toContain('border-radius: var(--border-radius-xl);');
    expect(sectionMessageCss).toContain('border: var(--border-width-sm) solid transparent;');
    expect(sectionMessageCss).toContain('padding: var(--spacing-lg);');
  });

  it('announces the status before the title, since the icon is decorative', () => {
    const expected: Record<SectionMessageTone, string> = {
      information: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
    };
    for (const [tone, label] of Object.entries(expected) as Array<[SectionMessageTone, string]>) {
      const { unmount } = render(
        <SectionMessage tone={tone} title="Sync paused">
          Reconnect to continue.
        </SectionMessage>,
      );
      expect(screen.getByRole('status')).toHaveTextContent(`${label}: Sync paused`);
      expect(screen.getByText(`${label}:`)).toHaveClass(styles.visuallyHidden);
      unmount();
    }

    render(
      <SectionMessage tone="error" statusLabel="Erreur">
        Upload failed.
      </SectionMessage>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Erreur: Upload failed.');
  });

  it('names the dismiss button with an overridable label', () => {
    render(
      <SectionMessage isDismissible dismissLabel="Cerrar">
        Saved.
      </SectionMessage>,
    );
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('still accepts the deprecated appearance prop as tone', () => {
    render(<SectionMessage appearance="warning">Sync paused.</SectionMessage>);
    expect(screen.getByRole('status')).toHaveClass(styles.tone_warning);
  });

  describe('errors', () => {
    const ERRORS = [
      { label: 'Client name', message: "Enter the client's first and last name.", targetId: 'client-name' },
      { label: 'Matter type', targetId: 'matter-type' },
    ];

    it('lists each error as a link to its control, under the description', () => {
      render(
        <SectionMessage tone="error" title="Fix 2 fields to create the matter" errors={ERRORS}>
          Nothing was saved.
        </SectionMessage>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass(styles.errors);
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent("Client name: Enter the client's first and last name.");
      expect(items[1]).toHaveTextContent(/^Matter type$/);
      expect(screen.getByRole('link', { name: 'Client name' })).toHaveAttribute('href', '#client-name');
      expect(screen.getByRole('link', { name: 'Matter type' })).toHaveAttribute('href', '#matter-type');
      // After the description, before the actions.
      expect(screen.getByText('Nothing was saved.').compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('moves focus to the control when a link is followed, without changing the URL', () => {
      render(
        <>
          <SectionMessage tone="error" errors={ERRORS} />
          <label htmlFor="client-name">Client name</label>
          <input id="client-name" />
        </>,
      );

      const link = screen.getByRole('link', { name: 'Client name' });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      act(() => {
        link.dispatchEvent(click);
      });
      expect(click.defaultPrevented).toBe(true);
      expect(screen.getByRole('textbox', { name: 'Client name' })).toHaveFocus();
    });

    it("focuses the first control inside a target that can't take focus, such as a group's fieldset", () => {
      render(
        <>
          <SectionMessage tone="error" errors={[{ label: 'Billing', targetId: 'billing' }]} />
          <fieldset id="billing">
            <legend>Billing</legend>
            <input type="radio" name="billing" aria-label="Hourly" />
            <input type="radio" name="billing" aria-label="Flat fee" />
          </fieldset>
        </>,
      );

      fireEvent.click(screen.getByRole('link', { name: 'Billing' }));
      expect(screen.getByRole('radio', { name: 'Hourly' })).toHaveFocus();
    });

    it('renders no list for an empty array, and no description when there are no children', () => {
      const { container, rerender } = render(<SectionMessage tone="error" title="Fix 1 field" errors={[]}>Body</SectionMessage>);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();

      rerender(<SectionMessage tone="error" title="Fix 1 field" errors={ERRORS.slice(0, 1)} />);
      expect(container.querySelector(`.${styles.description}`)).toBeNull();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
});
