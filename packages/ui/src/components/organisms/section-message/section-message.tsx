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

/*
 * Normalize the `actions` slot to a flat list of action nodes. Callers naturally write the actions
 * as a fragment (`<><Link/><Link/></>`) or an array; a single top-level fragment is unwrapped to its
 * children so each Link is separated, rather than being treated as one action.
 */
function toActionArray(actions: React.ReactNode): React.ReactNode[] {
  const top = React.Children.toArray(actions).filter(Boolean);

  if (top.length === 1 && React.isValidElement(top[0]) && top[0].type === React.Fragment) {
    const fragment = top[0] as React.ReactElement<{ children?: React.ReactNode }>;
    return React.Children.toArray(fragment.props.children).filter(Boolean);
  }

  return top;
}

/* Interleave a decorative middot between each action so callers pass bare Link children. */
function renderActions(actionItems: React.ReactNode[]) {
  return actionItems.map((child, index) => (
    <React.Fragment key={index}>
      {index > 0 ? (
        <span className={styles.separator} aria-hidden="true">
          &middot;
        </span>
      ) : null}
      {child}
    </React.Fragment>
  ));
}

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
    const actionItems = toActionArray(actions);

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
          {actionItems.length > 0 ? <div className={styles.actions}>{renderActions(actionItems)}</div> : null}
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
