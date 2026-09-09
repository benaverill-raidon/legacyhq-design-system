import type * as React from 'react';

export type ModalAppearance = 'default' | 'warning' | 'error';
export type ModalWidth = 'small' | 'medium' | 'large' | 'extraLarge';

export interface ModalDialogProps {
  /** Whether the dialog is shown. Controlled by the consumer. */
  open: boolean;
  /**
   * Called when the dialog requests to close - the close button, Escape, or a backdrop click. The
   * consumer sets `open` to false in response (the dialog never closes itself).
   */
  onClose: () => void;
  /**
   * The dialog title, rendered as the header heading and used as the dialog's accessible name
   * (`aria-labelledby`). Omit only when the dialog is labelled another way - then pass `aria-label`.
   */
  title?: React.ReactNode;
  /**
   * A supporting line rendered below the title in the header (Figma's modal-header description). It's
   * `body-md` text and, when present, is wired as the dialog's `aria-describedby`. Omit for a
   * title-only header.
   */
  description?: React.ReactNode;
  /**
   * Semantic intent. `warning` / `error` prepend a status icon to the title (in the matching
   * colour); `default` shows none. It does not tone the footer buttons - pair `appearance="error"`
   * with a matching Confirm button (e.g. `<Button appearance="primary" tone="error">`).
   */
  appearance?: ModalAppearance;
  /** Panel width: small (400px), medium (600px), large (752px), or extraLarge (968px). */
  width?: ModalWidth;
  /** The dialog body. Scrolls within the panel when it is taller than the viewport allows. */
  children?: React.ReactNode;
  /** The footer actions (e.g. a Cancel and a Confirm Button), rendered right-aligned. Omit for none. */
  footer?: React.ReactNode;
  /** Show the header close (X) button. Default true. */
  showCloseButton?: boolean;
  /** Accessible label for the close button. Default "Close". */
  closeLabel?: string;
  /** Close when Escape is pressed. Default true. */
  closeOnEscape?: boolean;
  /** Close when the backdrop (outside the panel) is clicked. Default true. */
  closeOnBackdropClick?: boolean;
  /** Element to focus when the dialog opens. Defaults to the panel itself. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Accessible name for the dialog when there is no `title`. */
  'aria-label'?: string;
  /** Composes with the panel's class list. */
  className?: string;
}
