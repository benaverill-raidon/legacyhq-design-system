import type * as React from 'react';

export type ModalTone = 'default' | 'warning' | 'error';
/** @deprecated Renamed to `ModalTone`. */
export type ModalAppearance = ModalTone;
export type ModalWidth = 'sm' | 'md' | 'lg' | 'xl';
/** @deprecated Use `sm`, `md`, `lg`, or `xl`, the size names every component uses. Still accepted. */
export type DeprecatedModalWidth = 'small' | 'medium' | 'large' | 'extraLarge';

export interface ModalDialogProps {
  /** Whether the dialog is shown. The dialog has no state of its own. */
  open: boolean;
  /** Called when the dialog asks to close: the close button, Escape, or a backdrop click. Set `open` to `false` in response; the dialog never closes itself. */
  onClose: () => void;
  /** The heading in the header, and the dialog's accessible name through `aria-labelledby`. Without one, pass `aria-label`. */
  title?: React.ReactNode;
  /** What the dialog means. `warning` and `error` put a status icon before the title; neither changes the footer buttons, so give the Confirm button the same `tone`. */
  tone?: ModalTone;
  /** @deprecated Use `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: ModalTone;
  /** The panel's width: 400, 600, 752, or 968px from `sm` to `xl`. It narrows to fit a small viewport. The long names are deprecated and still accepted. */
  width?: ModalWidth | DeprecatedModalWidth;
  /** The body. It scrolls inside the panel when it's taller than the viewport allows, with the header and footer in place. */
  children?: React.ReactNode;
  /** The actions, such as Cancel and a Confirm Button, aligned to the end. Leave it out for no footer. */
  footer?: React.ReactNode;
  /** Shows the close (X) button in the header. */
  showCloseButton?: boolean;
  /** The close button's accessible name. */
  closeLabel?: string;
  /** Shows an Expand button before Close, and is called when it's pressed. With both buttons, they share a Button Group. */
  onExpand?: () => void;
  /** The Expand button's accessible name. */
  expandLabel?: string;
  /** Calls `onClose` when Escape is pressed. */
  closeOnEscape?: boolean;
  /** Calls `onClose` when a press starts and ends on the backdrop, outside the panel. */
  closeOnBackdropClick?: boolean;
  /** The element to focus when the dialog opens. Without it, the panel takes focus. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** The dialog's accessible name when there's no `title`. Ignored when there is one. */
  'aria-label'?: string;
  /** Added to the panel's classes. */
  className?: string;
}
