import * as React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, GrowDiagonalIcon, StatusErrorIcon, StatusWarningIcon } from '../../../assets/icons';
import type { IconColor, IconProps } from '../../primitives/icon';
import { IconButton } from '../../atoms/icon-button';
import { ButtonGroup } from '../../molecules/button-group';
import { LAYERS, LayerContext, useLayer } from '../../primitives/layers';
import styles from './modal-dialog.module.css';
import type { DeprecatedModalWidth, ModalDialogProps, ModalTone, ModalWidth } from './modal-dialog.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/** The size names the deprecated width names map to. */
const WIDTHS: Record<DeprecatedModalWidth, ModalWidth> = { small: 'sm', medium: 'md', large: 'lg', extraLarge: 'xl' };

const STATUS_ICONS: Partial<Record<ModalTone, { Icon: React.ComponentType<IconProps>; color: IconColor }>> = {
  warning: { Icon: StatusWarningIcon, color: 'warning' },
  error: { Icon: StatusErrorIcon, color: 'error' },
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** A dialog needs a name: `title` (through aria-labelledby) or `aria-label`. */
function warnForMissingAccessibleName(title: React.ReactNode, ariaLabel?: string) {
  if (import.meta.env?.PROD) {
    return;
  }

  if (title != null || ariaLabel) {
    return;
  }

  console.warn('ModalDialog requires a `title` or an `aria-label` for an accessible name.');
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export const ModalDialog = React.memo(function ModalDialog({
  open,
  onClose,
  title,
  tone: requestedTone,
  appearance,
  width: requestedWidth = 'md',
  children,
  footer,
  showCloseButton = true,
  closeLabel = 'Close',
  onExpand,
  expandLabel = 'Expand',
  closeOnEscape = true,
  closeOnBackdropClick = true,
  initialFocusRef,
  'aria-label': ariaLabel,
  className,
}: ModalDialogProps) {
  const titleId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  // Where mousedown began, so a text-selection drag that ends on the backdrop doesn't close the
  // dialog - only a genuine press-and-release on the backdrop does.
  const backdropMouseDownRef = React.useRef(false);
  // Read the latest onClose inside the always-attached listener without re-subscribing each render.
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  // The dialog is a layer: Escape closes it only when nothing opened above it (a menu, a tooltip,
  // another dialog) is still open. See primitives/layers.ts. What it shows is inside its layer, so a
  // popup or dialog opened from it is above it.
  const { claimEscape, layer } = useLayer(open);

  React.useEffect(() => {
    if (open) {
      warnForMissingAccessibleName(title, ariaLabel);
    }
  }, [open, title, ariaLabel]);

  // Focus management: remember what was focused, move focus into the dialog, restore it on close.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // The portal is already committed to the DOM by the time this effect runs, so focus directly.
    (initialFocusRef?.current ?? panelRef.current)?.focus();

    return () => {
      previouslyFocused?.focus?.();
    };
  }, [open, initialFocusRef]);

  // Scroll-lock the page behind the dialog while it is open.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Escape closes the dialog when it's the topmost layer. It listens in the bubble phase, so a
  // control inside that handles Escape itself and calls preventDefault() keeps it.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (closeOnEscape && claimEscape(event)) {
        onCloseRef.current();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, claimEscape]);

  // Trap Tab focus inside the panel.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = getFocusable(panelRef.current);
      if (focusable.length === 0) {
        // Nothing focusable inside - keep focus on the panel rather than letting it escape.
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  // `appearance` is the deprecated name for `tone`; the long width names are deprecated too.
  const tone: ModalTone = requestedTone ?? appearance ?? 'default';
  const width: ModalWidth = WIDTHS[requestedWidth as DeprecatedModalWidth] ?? (requestedWidth as ModalWidth);
  const status = STATUS_ICONS[tone];

  // Header actions: an optional Expand (maximize) button, then the Close button. When both are
  // present they share a Button Group (matching Figma's modal-header); a lone button renders on its
  // own rather than in a single-child group.
  const expandButton = onExpand ? (
    <IconButton key="expand" appearance="subtle" size="sm" aria-label={expandLabel} onClick={onExpand}>
      <GrowDiagonalIcon />
    </IconButton>
  ) : null;
  const closeButton = showCloseButton ? (
    <IconButton key="close" appearance="subtle" size="sm" aria-label={closeLabel} onClick={onClose}>
      <CloseIcon />
    </IconButton>
  ) : null;
  const headerButtons = [expandButton, closeButton].filter(Boolean);
  const headerActions =
    headerButtons.length > 1 ? (
      <ButtonGroup className={styles.headerActions}>{headerButtons}</ButtonGroup>
    ) : (
      (headerButtons[0] ?? null)
    );
  const hasHeader = title != null || headerButtons.length > 0;

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    backdropMouseDownRef.current = event.target === event.currentTarget;
  };

  const handleBackdropMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && backdropMouseDownRef.current && event.target === event.currentTarget) {
      onClose();
    }
    backdropMouseDownRef.current = false;
  };

  // The fragment adds nothing to the DOM; it lets Storybook's docgen (react-docgen) recognize this
  // as a component, which it doesn't for a bare createPortal return, so the Docs API table renders.
  return (
    <>
      {createPortal(
        // Everything the dialog shows is inside its layer: a popup or dialog opened from it is above it.
        <LayerContext.Provider value={layer}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className={styles.backdrop}
            // z-index comes from the one layer scale (primitives/layers.ts): below popups and toasts.
            style={{ zIndex: LAYERS.dialog }}
            onMouseDown={handleBackdropMouseDown}
            onMouseUp={handleBackdropMouseUp}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title != null ? titleId : undefined}
              aria-label={title == null ? ariaLabel : undefined}
              tabIndex={-1}
              className={mergeClassNames(styles.panel, styles[`width_${width}`], className)}
              data-tone={tone}
              data-has-header={hasHeader ? 'true' : undefined}
              data-has-footer={footer != null ? 'true' : undefined}
            >
              {hasHeader ? (
                <div className={styles.header}>
                  <div className={styles.titleArea}>
                    {status ? (
                      <span className={styles.statusIcon} aria-hidden="true">
                        <status.Icon size="md" color={status.color} />
                      </span>
                    ) : null}
                    {title != null ? (
                      <h2 id={titleId} className={styles.title}>
                        {title}
                      </h2>
                    ) : null}
                  </div>
                  {headerActions}
                </div>
              ) : null}

              <div className={styles.body}>{children}</div>

              {footer != null ? <div className={styles.footer}>{footer}</div> : null}
            </div>
          </div>
        </LayerContext.Provider>,
        document.body,
      )}
    </>
  );
});

ModalDialog.displayName = 'ModalDialog';
