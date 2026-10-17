import * as React from 'react';
import type { ComponentType } from 'react';
import {
  StatusErrorIcon,
  StatusInformationIcon,
  StatusSuccessIcon,
  StatusWarningIcon,
} from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Popup } from '../../primitives/popup';
import type { IconColor, IconProps } from '../../primitives/icon';
import styles from './inline-message.module.css';
import type { InlineMessageProps, InlineMessageTone } from './inline-message.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * `default` has no dedicated status icon - confirmed absent from the generated icon set, matching
 * Figma's own trigger, which falls back to an unrelated generic placeholder glyph ("node") for this
 * tone rather than a real one. A plain CSS dot (`.dot`) substitutes here instead of fabricating a
 * "default status" icon that doesn't exist in the source library.
 */
const TONE_ICONS: Partial<Record<InlineMessageTone, { Icon: ComponentType<IconProps>; color: IconColor }>> = {
  information: { Icon: StatusInformationIcon, color: 'information' },
  success: { Icon: StatusSuccessIcon, color: 'success' },
  warning: { Icon: StatusWarningIcon, color: 'warning' },
  error: { Icon: StatusErrorIcon, color: 'error' },
};

const STATUS_LABELS: Partial<Record<InlineMessageTone, string>> = {
  information: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

/** What can take focus inside the popup, for the Tab handling below. */
const TABBABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function ToneIcon({ tone }: { tone: InlineMessageTone }) {
  const mapped = TONE_ICONS[tone];

  return (
    <span className={styles.iconSlot} aria-hidden="true">
      {mapped ? <mapped.Icon size="md" spacing="spacious" color={mapped.color} /> : <span className={styles.dot} />}
    </span>
  );
}

export const InlineMessage = React.memo(function InlineMessage({
  title,
  secondaryText,
  tone: requestedTone = 'default',
  content,
  open,
  defaultOpen = false,
  onOpenChange,
  statusLabel,
  className,
  'data-force-state': dataForceState,
}: InlineMessageProps) {
  // `info` is the deprecated name for `information`.
  const tone: InlineMessageTone = requestedTone === 'info' ? 'information' : requestedTone;
  const status = statusLabel ?? STATUS_LABELS[tone];
  const titleId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;
  const hasContent = content !== null && content !== undefined;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // The popup is portalled to the end of the page, so it takes focus when it opens, and leaving it
  // (Tab past its last item, Shift+Tab before its first, Escape) closes it and returns focus to the
  // row: the tab order runs row, popup, then the rest of the page.
  const closeToTrigger = React.useCallback(() => {
    handleOpenChange(false);
    triggerRef.current?.focus();
  }, [handleOpenChange]);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!isOpen || !panel) return undefined;
    // Wait a frame, as Dropdown Menu does: Popup keeps the panel at visibility: hidden until it has
    // positioned it, and a hidden element can't take focus, so focusing now fails on the first open.
    const frame = window.requestAnimationFrame(() => {
      if (!panel.contains(document.activeElement)) panel.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeToTrigger();
        return;
      }
      if (event.key !== 'Tab') return;
      const tabbables = [...panel.querySelectorAll<HTMLElement>(TABBABLE)];
      const active = document.activeElement;
      const leaving = event.shiftKey ? active === panel || active === tabbables[0] : !tabbables.length || active === tabbables[tabbables.length - 1];
      if (leaving) {
        event.preventDefault();
        closeToTrigger();
      }
    };
    panel.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      panel.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeToTrigger]);

  const row = (
    <>
      <ToneIcon tone={tone} />
      <span className={styles.text}>
        <span className={styles.title} id={titleId}>
          {/* The icon is decorative, so the status is said in hidden text before the title. */}
          {status ? (
            <>
              <span className={styles.visuallyHidden}>{status}:</span>{' '}
            </>
          ) : null}
          {title}
        </span>
        {secondaryText !== undefined ? <span className={styles.secondaryText}>{secondaryText}</span> : null}
      </span>
    </>
  );

  if (!hasContent) {
    return <div className={mergeClassNames(styles.root, className)}>{row}</div>;
  }

  return (
    <Popup
      open={isOpen}
      onOpenChange={handleOpenChange}
      alignment="bottomLeft"
      content={
        // A non-modal dialog named by the title, focusable so it can take focus when it opens.
        <div ref={panelRef} className={styles.panelContent} role="dialog" aria-labelledby={titleId} tabIndex={-1}>
          {content}
        </div>
      }
    >
      <button
        ref={triggerRef}
        type="button"
        className={mergeClassNames(
          styles.root,
          styles.trigger,
          styles[`tone_${tone}`],
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        data-force-state={dataForceState}
        onClick={() => handleOpenChange(!isOpen)}
      >
        {row}
      </button>
    </Popup>
  );
});

InlineMessage.displayName = 'InlineMessage';
