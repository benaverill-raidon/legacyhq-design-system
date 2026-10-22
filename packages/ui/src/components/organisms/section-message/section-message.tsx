import * as React from 'react';
import type { ComponentType } from 'react';
import {
  CloseIcon,
  StatusErrorIcon,
  StatusInformationIcon,
  StatusSuccessIcon,
  StatusWarningIcon,
} from '../../../assets/icons';
import type { IconColor, IconProps } from '../../primitives/icon';
import { IconButton } from '../../atoms/icon-button';
import { Link } from '../../atoms/link';
import styles from './section-message.module.css';
import type { SectionMessageError, SectionMessageProps, SectionMessageTone } from './section-message.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * Each tone owns its status icon and the icon color it renders in - the icon keeps its own
 * status color (unlike Banner, whose icon inherits the bar's content color), matching the tinted
 * on-light treatment. The same StatusIcon set InlineMessage uses.
 */
const TONE_ICON: Record<SectionMessageTone, { Icon: ComponentType<IconProps>; color: IconColor }> = {
  information: { Icon: StatusInformationIcon, color: 'information' },
  success: { Icon: StatusSuccessIcon, color: 'success' },
  warning: { Icon: StatusWarningIcon, color: 'warning' },
  error: { Icon: StatusErrorIcon, color: 'error' },
};

/** What each tone announces before the message. */
const STATUS_LABELS: Record<SectionMessageTone, string> = {
  information: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

/** What can take focus: the control an error link moves to, or the first one inside its target. */
const FOCUSABLE =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * Moves focus to an error's control. The link's own navigation is stopped: following an in-page
 * link scrolls to its target but doesn't focus it, and it would change the URL. A target that can't
 * take focus itself, such as a fieldset, hands focus to the first control inside it.
 */
function focusTarget(event: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) return;
  event.preventDefault();
  const control = target.matches(FOCUSABLE) ? target : target.querySelector<HTMLElement>(FOCUSABLE);
  (control ?? target).focus();
}

function ErrorList({ errors }: { errors: SectionMessageError[] }) {
  return (
    <ul className={styles.errors}>
      {errors.map(({ label, message, targetId }) => (
        <li key={targetId}>
          <Link href={`#${targetId}`} emphasis="default" onClick={(event) => focusTarget(event, targetId)}>
            {label}
          </Link>
          {message !== undefined && message !== null ? <>: {message}</> : null}
        </li>
      ))}
    </ul>
  );
}

export const SectionMessage = React.memo(
  React.forwardRef<HTMLDivElement, SectionMessageProps>(function SectionMessage(
    {
      tone: requestedTone,
      appearance,
      statusLabel,
      title,
      children,
      errors,
      actions,
      isDismissible = false,
      dismissLabel = 'Dismiss',
      onDismiss,
      className,
      role = 'status',
      ...rest
    },
    forwardedRef,
  ) {
    const [dismissed, setDismissed] = React.useState(false);

    const handleDismiss = React.useCallback(() => {
      setDismissed(true);
      onDismiss?.();
    }, [onDismiss]);

    if (dismissed) {
      return null;
    }

    // `appearance` is the deprecated name for `tone`.
    const tone: SectionMessageTone = requestedTone ?? appearance ?? 'information';
    const { Icon, color } = TONE_ICON[tone];
    const status = statusLabel ?? STATUS_LABELS[tone];
    const hasTitle = title !== undefined && title !== null;
    const hasDescription = children !== undefined && children !== null && children !== false;
    const hasErrors = errors !== undefined && errors.length > 0;
    const hasActions = React.Children.toArray(actions).filter(Boolean).length > 0;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role={role}
        className={mergeClassNames(styles.root, styles[`tone_${tone}`], className)}
      >
        <span className={styles.iconSlot} aria-hidden="true">
          <Icon size="md" spacing="spacious" color={color} />
        </span>

        <div className={styles.content}>
          {status ? (
            <>
              <span className={styles.visuallyHidden}>{status}:</span>{' '}
            </>
          ) : null}
          {hasTitle ? <div className={styles.title}>{title}</div> : null}
          {hasDescription ? <div className={styles.description}>{children}</div> : null}
          {hasErrors ? <ErrorList errors={errors} /> : null}
          {hasActions ? <div className={styles.actions}>{actions}</div> : null}
        </div>

        {isDismissible ? (
          <IconButton
            className={styles.dismiss}
            appearance="subtle"
            size="xs"
            aria-label={dismissLabel}
            onClick={handleDismiss}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
    );
  }),
);

SectionMessage.displayName = 'SectionMessage';
