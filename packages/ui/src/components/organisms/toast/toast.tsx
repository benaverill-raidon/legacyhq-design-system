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
import type { ToastAppearance, ToastProps } from './toast.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * Each non-loading appearance maps to an IconTile tone plus a status glyph (default has no glyph, so
 * a plain dot stands in - the same convention Banner/InlineMessage use). `loading` shows a Spinner
 * instead of a tile.
 */
const APPEARANCE_CONFIG: Record<Exclude<ToastAppearance, 'loading'>, { tone: IconTileTone; Icon?: ComponentType<IconProps> }> = {
  default: { tone: 'gray' },
  success: { tone: 'green', Icon: StatusSuccessIcon },
  info: { tone: 'blue', Icon: StatusInformationIcon },
  warning: { tone: 'orange', Icon: StatusWarningIcon },
  error: { tone: 'red', Icon: StatusErrorIcon },
};

function ToastLeadingIcon({ appearance }: { appearance: ToastAppearance }) {
  if (appearance === 'loading') {
    return (
      <span className={styles.spinnerSlot} aria-hidden="true">
        <Spinner size="sm" />
      </span>
    );
  }

  const { tone, Icon } = APPEARANCE_CONFIG[appearance];

  return (
    <IconTile className={styles.tile} tone={tone} size="xs" shape="square" decorative>
      {Icon ? <Icon /> : <span className={styles.dot} />}
    </IconTile>
  );
}

export const Toast = React.memo(
  React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
    {
      appearance = 'default',
      title,
      description,
      actions,
      expanded = true,
      isDismissible = true,
      onDismiss,
      className,
      role = 'status',
      ...rest
    },
    forwardedRef,
  ) {
    const hasDescription = expanded && description !== undefined && description !== null;
    const hasActions = expanded && React.Children.toArray(actions).filter(Boolean).length > 0;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role={role}
        className={mergeClassNames(styles.root, className)}
        data-appearance={appearance}
      >
        <ToastLeadingIcon appearance={appearance} />

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{title}</div>
            {isDismissible ? (
              <IconButton
                className={styles.dismiss}
                appearance="subtle"
                size="xs"
                aria-label="Dismiss"
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
