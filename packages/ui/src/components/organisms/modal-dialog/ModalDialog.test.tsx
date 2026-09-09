// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalDialog } from './modal-dialog';
import styles from './modal-dialog.module.css';

const modalCss = readFileSync('packages/ui/src/components/organisms/modal-dialog/modal-dialog.module.css', 'utf8');

afterEach(cleanup);

describe('ModalDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ModalDialog open={false} onClose={() => {}} title="Title">
        Body
      </ModalDialog>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders a modal dialog with the right ARIA when open', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Delete repository?">
        This cannot be undone.
      </ModalDialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // Named by its title.
    expect(dialog).toHaveAccessibleName('Delete repository?');
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('renders a description and wires it as aria-describedby', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Move to archive?" description="Archived projects can be restored.">
        Body
      </ModalDialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleDescription('Archived projects can be restored.');
    expect(screen.getByText('Archived projects can be restored.')).toBeInTheDocument();
  });

  it('has no aria-describedby when there is no description', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Title">
        Body
      </ModalDialog>,
    );

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('renders the header for a description-only dialog', () => {
    render(
      <ModalDialog open onClose={() => {}} aria-label="Notice" showCloseButton={false} description="Just so you know.">
        Body
      </ModalDialog>,
    );

    expect(screen.getByText('Just so you know.')).toBeInTheDocument();
  });

  it('portals into document.body', () => {
    const { container } = render(
      <ModalDialog open onClose={() => {}} title="Title">
        Body
      </ModalDialog>,
    );

    // Not rendered inside the component's own container - it is portaled to the body.
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('falls back to aria-label when there is no title', () => {
    render(
      <ModalDialog open onClose={() => {}} aria-label="Settings">
        Body
      </ModalDialog>,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Settings');
  });

  it('renders the footer actions', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Title" footer={<button type="button">Confirm</button>}>
        Body
      </ModalDialog>,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('calls onClose from the close button', () => {
    const onClose = vi.fn();
    render(
      <ModalDialog open onClose={onClose} title="Title">
        Body
      </ModalDialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the close button when showCloseButton is false', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Title" showCloseButton={false}>
        Body
      </ModalDialog>,
    );

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('closes on Escape, unless closeOnEscape is false', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ModalDialog open onClose={onClose} title="Title">
        Body
      </ModalDialog>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <ModalDialog open onClose={onClose} title="Title" closeOnEscape={false}>
        Body
      </ModalDialog>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a backdrop click, unless closeOnBackdropClick is false', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ModalDialog open onClose={onClose} title="Title">
        Body
      </ModalDialog>,
    );

    const backdrop = document.querySelector(`.${styles.backdrop}`) as HTMLElement;
    fireEvent.mouseDown(backdrop);
    fireEvent.mouseUp(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <ModalDialog open onClose={onClose} title="Title" closeOnBackdropClick={false}>
        Body
      </ModalDialog>,
    );
    fireEvent.mouseDown(backdrop);
    fireEvent.mouseUp(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the click is inside the panel', () => {
    const onClose = vi.fn();
    render(
      <ModalDialog open onClose={onClose} title="Title">
        <p>Body content</p>
      </ModalDialog>,
    );

    const panel = screen.getByRole('dialog');
    fireEvent.mouseDown(panel);
    fireEvent.mouseUp(panel);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a status icon for warning and error, but not default', () => {
    const { container: warn } = render(
      <ModalDialog open onClose={() => {}} title="Title" appearance="warning">
        Body
      </ModalDialog>,
    );
    expect(warn.ownerDocument.querySelector(`.${styles.statusIcon}`)).not.toBeNull();
    cleanup();

    const { container: def } = render(
      <ModalDialog open onClose={() => {}} title="Title">
        Body
      </ModalDialog>,
    );
    expect(def.ownerDocument.querySelector(`.${styles.statusIcon}`)).toBeNull();
  });

  it('applies the width class and appearance data attribute', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Title" width="large" appearance="error">
        Body
      </ModalDialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass(styles.width_large);
    expect(dialog).toHaveAttribute('data-appearance', 'error');
  });

  it('composes className onto the panel', () => {
    render(
      <ModalDialog open onClose={() => {}} title="Title" className="custom-panel">
        Body
      </ModalDialog>,
    );

    expect(screen.getByRole('dialog')).toHaveClass('custom-panel');
  });

  it('moves focus into the dialog on open and restores it on close', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <ModalDialog open={open} onClose={() => setOpen(false)} title="Title">
            Body
          </ModalDialog>
        </>
      );
    }

    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    // Focus moved into the dialog panel.
    expect(screen.getByRole('dialog')).toHaveFocus();

    // Closing restores focus to the trigger.
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(trigger).toHaveFocus();
  });

  it('locks page scroll while open and restores it on close', () => {
    const { rerender } = render(
      <ModalDialog open onClose={() => {}} title="Title">
        Body
      </ModalDialog>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ModalDialog open={false} onClose={() => {}} title="Title">
        Body
      </ModalDialog>,
    );
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('uses semantic tokens for the surface and radius', () => {
    expect(modalCss).toContain('background: var(--color-background-brand-secondary-overlay-blanket);');
    expect(modalCss).toContain('border-radius: var(--border-radius-xxl);');
  });
});
