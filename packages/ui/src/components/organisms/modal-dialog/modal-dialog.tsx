import * as React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, StatusErrorIcon, StatusWarningIcon } from '../../../assets/icons';
import type { IconColor, IconProps } from '../../primitives/icon';
import { IconButton } from '../../atoms/icon-button';
import styles from './modal-dialog.module.css';
import type { ModalAppearance, ModalDialogProps } from './modal-dialog.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

const STATUS_ICONS: Partial<Record<ModalAppearance, { Icon: React.ComponentType<IconProps>; color: IconColor }>> = {
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

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export const ModalDialog = React.memo(function ModalDialog({
  open,
  onClose,
  title,
  description,
  appearance = 'default',
  width = 'medium',
  children,
  footer,
  showCloseButton = true,
  closeLabel = 'Close',
  closeOnEscape = true,
  closeOnBackdropClick = true,
  initialFocusRef,
  'aria-label': ariaLabel,
  className,
}: ModalDialogProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  // Where mousedown began, so a text-selection drag that ends on the backdrop doesn't close the
  // dialog - only a genuine press-and-release on the backdrop does.
  const backdropMouseDownRef = React.useRef(false);
  // Read the latest onClose inside the always-attached listener without re-subscribing each render.
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

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

  // Escape to close, and trap Tab focus inside the panel.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (closeOnEscape && event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

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
  }, [open, closeOnEscape]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const status = STATUS_ICONS[appearance];
  const hasHeader = title != null || description != null || showCloseButton;

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    backdropMouseDownRef.current = event.target === event.currentTarget;
  };

  const handleBackdropMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && backdropMouseDownRef.current && event.target === event.currentTarget) {
      onClose();
    }
    backdropMouseDownRef.current = false;
  };

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={styles.backdrop} onMouseDown={handleBackdropMouseDown} onMouseUp={handleBackdropMouseUp}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
        aria-label={title == null ? ariaLabel : undefined}
        aria-describedby={description != null ? descriptionId : undefined}
        tabIndex={-1}
        className={mergeClassNames(styles.panel, styles[`width_${width}`], className)}
        data-appearance={appearance}
        data-has-header={hasHeader ? 'true' : undefined}
        data-has-footer={footer != null ? 'true' : undefined}
      >
        {hasHeader ? (
          <div className={styles.header}>
            <div className={styles.titleRow}>
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
              {showCloseButton ? (
                <IconButton appearance="subtle" size="sm" aria-label={closeLabel} onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              ) : null}
            </div>
            {description != null ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={styles.body}>{children}</div>

        {footer != null ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
});

ModalDialog.displayName = 'ModalDialog';
