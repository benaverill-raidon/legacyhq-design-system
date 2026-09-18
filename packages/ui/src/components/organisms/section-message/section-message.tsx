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
import styles from './section-message.module.css';
import type { SectionMessageAppearance, SectionMessageProps } from './section-message.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * Each appearance owns its status icon and the icon color it renders in - the icon keeps its own
 * status color (unlike Banner, whose icon inherits the bar's content color), matching the tinted
 * on-light treatment. The same StatusIcon set InlineMessage uses.
 */
const APPEARANCE_ICON: Record<SectionMessageAppearance, { Icon: ComponentType<IconProps>; color: IconColor }> = {
  information: { Icon: StatusInformationIcon, color: 'information' },
  success: { Icon: StatusSuccessIcon, color: 'success' },
  warning: { Icon: StatusWarningIcon, color: 'warning' },
  error: { Icon: StatusErrorIcon, color: 'error' },
};

export const SectionMessage = React.memo(
  React.forwardRef<HTMLDivElement, SectionMessageProps>(function SectionMessage(
    {
      appearance = 'information',
      title,
      children,
      actions,
      isDismissible = false,
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

    const { Icon, color } = APPEARANCE_ICON[appearance];
    const hasTitle = title !== undefined && title !== null;
    const hasActions = React.Children.toArray(actions).filter(Boolean).length > 0;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role={role}
        className={mergeClassNames(styles.root, styles[`appearance_${appearance}`], className)}
      >
        <span className={styles.iconSlot} aria-hidden="true">
          <Icon size="md" spacing="spacious" color={color} />
        </span>

        <div className={styles.content}>
          {hasTitle ? <div className={styles.title}>{title}</div> : null}
          <div className={styles.description}>{children}</div>
          {hasActions ? <div className={styles.actions}>{actions}</div> : null}
        </div>

        {isDismissible ? (
          <IconButton
            className={styles.dismiss}
            appearance="subtle"
            size="xs"
            aria-label="Dismiss"
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
