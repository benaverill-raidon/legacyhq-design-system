import * as React from 'react';
import type { ComponentType } from 'react';
import {
  CloseIcon,
  StatusErrorIcon,
  StatusInformationIcon,
  StatusSuccessIcon,
  StatusWarningIcon,
} from '../../../assets/icons';
import type { IconProps } from '../../primitives/icon';
import { IconButton } from '../../atoms/icon-button';
import { Spinner } from '../../atoms/spinner';
import { IconTile } from '../../molecules/icon-tile';
import type { IconTileTone } from '../../molecules/icon-tile';
import styles from './toast.module.css';
import type { ToastProps, ToastTone } from './toast.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * Each non-loading tone maps to an IconTile tone plus a status glyph (default has no glyph, so
 * a plain dot stands in - the same convention Banner/InlineMessage use). `loading` shows a Spinner
 * instead of a tile.
 */
const TONE_CONFIG: Record<Exclude<ToastTone, 'loading'>, { tileTone: IconTileTone; Icon?: ComponentType<IconProps> }> = {
  default: { tileTone: 'gray' },
  success: { tileTone: 'green', Icon: StatusSuccessIcon },
  information: { tileTone: 'blue', Icon: StatusInformationIcon },
  warning: { tileTone: 'orange', Icon: StatusWarningIcon },
  error: { tileTone: 'red', Icon: StatusErrorIcon },
};

/** What each tone announces before the title; `default` and `loading` carry no status. */
const STATUS_LABELS: Partial<Record<ToastTone, string>> = {
  success: 'Success',
  information: 'Information',
  warning: 'Warning',
  error: 'Error',
};

function ToastLeadingIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'loading') {
    return (
      <span className={styles.spinnerSlot} aria-hidden="true">
        <Spinner size="sm" />
      </span>
    );
  }

  const { tileTone, Icon } = TONE_CONFIG[tone];

  return (
    <IconTile className={styles.tile} tone={tileTone} size="xs" shape="square" decorative>
      {Icon ? <Icon /> : <span className={styles.dot} />}
    </IconTile>
  );
}

export const Toast = React.memo(
  React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
    {
      tone: requestedTone,
      appearance,
      statusLabel,
      title,
      description,
      actions,
      expanded = true,
      isDismissible = true,
      dismissLabel = 'Dismiss',
      onDismiss,
      className,
      role = 'status',
      ...rest
    },
    forwardedRef,
  ) {
    // `appearance` is the deprecated name for `tone`, and `info` for `information`.
    const requested = requestedTone ?? appearance ?? 'default';
    const tone: ToastTone = requested === 'info' ? 'information' : requested;
    const status = statusLabel ?? STATUS_LABELS[tone];
    const hasDescription = expanded && description !== undefined && description !== null;
    const hasActions = expanded && React.Children.toArray(actions).filter(Boolean).length > 0;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role={role}
        className={mergeClassNames(styles.root, className)}
        data-tone={tone}
      >
        <ToastLeadingIcon tone={tone} />

        <div className={styles.content}>
          {status ? (
            <>
              <span className={styles.visuallyHidden}>{status}:</span>{' '}
            </>
          ) : null}
          <div className={styles.titleRow}>
            <div className={styles.title}>{title}</div>
            {isDismissible ? (
              <IconButton
                className={styles.dismiss}
                appearance="subtle"
                size="xs"
                aria-label={dismissLabel}
                tooltip={false}
                onClick={onDismiss}
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </div>

          {hasDescription ? <div className={styles.description}>{description}</div> : null}
          {hasActions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </div>
    );
  }),
);

Toast.displayName = 'Toast';
