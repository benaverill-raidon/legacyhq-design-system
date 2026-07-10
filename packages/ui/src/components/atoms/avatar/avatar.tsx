import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { AvatarPresenceBusyIcon } from './avatar-presence-busy';
import { AvatarPresenceOfflineIcon } from './avatar-presence-offline';
import { AvatarPresenceOnlineIcon } from './avatar-presence-online';
import { AvatarStatusApprovedIcon } from './avatar-status-approved';
import { AvatarStatusDeclinedIcon } from './avatar-status-declined';
import styles from './avatar.module.css';
import type { AvatarPresence, AvatarProps, AvatarStatus } from './avatar.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

const PRESENCE_LABELS: Record<Exclude<AvatarPresence, 'none'>, string> = {
  online: 'online',
  offline: 'offline',
  busy: 'busy',
};

const STATUS_LABELS: Record<Exclude<AvatarStatus, 'none'>, string> = {
  accepted: 'accepted',
  declined: 'declined',
};

function getVisibleBadge(status: AvatarStatus, presence: AvatarPresence) {
  return status !== 'none' ? status : presence;
}

function getAccessibleLabel({
  ariaLabel,
  ariaLabelledBy,
  alt,
  decorative,
  isButton,
  isSelected,
  name,
  presence,
  status,
}: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  alt?: string;
  decorative: boolean;
  isButton: boolean;
  isSelected: boolean;
  name?: string;
  presence: AvatarPresence;
  status: AvatarStatus;
}) {
  if (decorative && !isButton) {
    return undefined;
  }

  if (ariaLabelledBy) {
    return undefined;
  }

  const baseLabel = ariaLabel ?? name ?? alt;

  if (!baseLabel) {
    return undefined;
  }

  const details: string[] = [];
  const visibleBadge = getVisibleBadge(status, presence);

  if (isSelected) {
    details.push('selected');
  }

  if (visibleBadge !== 'none') {
    details.push(
      visibleBadge in STATUS_LABELS
        ? STATUS_LABELS[visibleBadge as Exclude<AvatarStatus, 'none'>]
        : PRESENCE_LABELS[visibleBadge as Exclude<AvatarPresence, 'none'>],
    );
  }

  return details.length > 0 ? baseLabel + ', ' + details.join(', ') : baseLabel;
}

function warnForMissingAccessibleName(
  computedLabel: string | undefined,
  ariaLabelledBy: string | undefined,
  decorative: boolean,
  isButton: boolean,
) {
  if (import.meta.env?.PROD) {
    return;
  }

  if (decorative && !isButton) {
    return;
  }

  if (computedLabel || ariaLabelledBy) {
    return;
  }

  console.warn('Avatar requires `name`, `alt`, `aria-label`, or `aria-labelledby` unless it is decorative.');
}

function AvatarFallbackIcon() {
  return (
    <svg className={styles.fallbackIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M8.00002 3.93317C8.77335 3.93317 9.40002 4.55984 9.40002 5.33317C9.40002 6.1065 8.77335 6.73317 8.00002 6.73317C7.22669 6.73317 6.60002 6.1065 6.60002 5.33317C6.60002 4.55984 7.22669 3.93317 8.00002 3.93317ZM8.00002 9.93317C9.98002 9.93317 12.0667 10.9065 12.0667 11.3332V12.0665H3.93335V11.3332C3.93335 10.9065 6.02002 9.93317 8.00002 9.93317ZM8.00002 2.6665C6.52669 2.6665 5.33335 3.85984 5.33335 5.33317C5.33335 6.8065 6.52669 7.99984 8.00002 7.99984C9.47335 7.99984 10.6667 6.8065 10.6667 5.33317C10.6667 3.85984 9.47335 2.6665 8.00002 2.6665ZM8.00002 8.6665C6.22002 8.6665 2.66669 9.55984 2.66669 11.3332V13.3332H13.3334V11.3332C13.3334 9.55984 9.78002 8.6665 8.00002 8.6665Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AvatarBadgeIcon({ badge }: { badge: Exclude<AvatarPresence | AvatarStatus, 'none'> }) {
  switch (badge) {
    case 'online':
      return <AvatarPresenceOnlineIcon className={styles.badgeGlyph} />;
    case 'busy':
      return <AvatarPresenceBusyIcon className={styles.badgeGlyph} />;
    case 'offline':
      return <AvatarPresenceOfflineIcon className={styles.badgeGlyph} />;
    case 'accepted':
      return <AvatarStatusApprovedIcon className={styles.badgeGlyph} />;
    case 'declined':
      return <AvatarStatusDeclinedIcon className={styles.badgeGlyph} />;
    default:
      return null;
  }
}

export const Avatar = React.memo(
  React.forwardRef<HTMLButtonElement | HTMLSpanElement, AvatarProps>(function Avatar(
    {
      size = 'md',
      src,
      alt,
      name,
      presence = 'none',
      status = 'none',
      isSelected = false,
      isDisabled = false,
      isInteractive = false,
      decorative = false,
      className,
      onClick,
      type = 'button',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    forwardedRef,
  ) {
    const [imageFailed, setImageFailed] = React.useState(false);
    const isButton = isInteractive || typeof onClick === 'function';
    const decorativeAvatar = decorative && !isButton;
    const visibleBadge = getVisibleBadge(status, presence);
    const computedLabel = getAccessibleLabel({
      ariaLabel,
      ariaLabelledBy,
      alt,
      decorative: decorativeAvatar,
      isButton,
      isSelected,
      name,
      presence,
      status,
    });
    const rootClassName = mergeClassNames(
      styles.root,
      styles['size_' + size],
      isButton && focusRingClassNames.focusRing,
      isButton && focusRingClassNames.focusRingDefault,
      className,
    );

    React.useEffect(() => {
      setImageFailed(false);
    }, [src]);

    React.useEffect(() => {
      warnForMissingAccessibleName(computedLabel, ariaLabelledBy, decorativeAvatar, isButton);
    }, [ariaLabelledBy, computedLabel, decorativeAvatar, isButton]);

    const content = (
      <span className={styles.surface}>
        <span className={styles.content}>
          {src && !imageFailed ? (
            <img
              className={styles.image}
              src={src}
              alt=""
              aria-hidden="true"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <AvatarFallbackIcon />
          )}
        </span>
        {visibleBadge !== 'none' ? (
          <span className={styles.badgeContainer} data-badge={visibleBadge} aria-hidden="true">
            <span className={styles.badgeIcon} data-badge={visibleBadge}>
              <AvatarBadgeIcon badge={visibleBadge as Exclude<AvatarPresence | AvatarStatus, 'none'>} />
            </span>
          </span>
        ) : null}
      </span>
    );

    if (isButton) {
      return (
        <button
          {...rest}
          ref={forwardedRef as React.ForwardedRef<HTMLButtonElement>}
          type={type}
          className={rootClassName}
          disabled={isDisabled}
          aria-label={computedLabel}
          aria-labelledby={ariaLabelledBy}
          data-size={size}
          data-interactive="true"
          data-selected={isSelected ? 'true' : undefined}
          data-disabled={isDisabled ? 'true' : undefined}
          data-presence={presence}
          data-status={status}
          data-badge={visibleBadge}
          onClick={onClick}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        {...rest}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
        className={rootClassName}
        role={decorativeAvatar ? undefined : 'img'}
        aria-hidden={decorativeAvatar ? true : undefined}
        aria-label={computedLabel}
        aria-labelledby={ariaLabelledBy}
        data-size={size}
        data-interactive="false"
        data-selected={isSelected ? 'true' : undefined}
        data-disabled={isDisabled ? 'true' : undefined}
        data-presence={presence}
        data-status={status}
        data-badge={visibleBadge}
      >
        {content}
      </span>
    );
  }),
);

Avatar.displayName = 'Avatar';
