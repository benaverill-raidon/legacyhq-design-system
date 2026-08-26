import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { AvatarPresenceBusyIcon } from './avatar-presence-busy';
import { AvatarPresenceOfflineIcon } from './avatar-presence-offline';
import { AvatarPresenceOnlineIcon } from './avatar-presence-online';
import { AvatarStatusApprovedIcon } from './avatar-status-approved';
import { AvatarStatusDeclinedIcon } from './avatar-status-declined';
import styles from './avatar.module.css';
import type { AvatarEntityType, AvatarPresence, AvatarProps, AvatarStatus } from './avatar.types';

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

function AvatarFallbackArtwork({ entityType }: { entityType: AvatarEntityType }) {
  return (
    <span
      className={styles.fallbackArtwork}
      data-avatar-fallback
      data-entity-type={entityType}
      aria-hidden="true"
    />
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
      entityType = 'person',
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
    const [previousSrc, setPreviousSrc] = React.useState(src);
    if (src !== previousSrc) {
      setPreviousSrc(src);
      setImageFailed(false);
    }
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
            <AvatarFallbackArtwork entityType={entityType} />
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
          data-entity-type={entityType}
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
        data-entity-type={entityType}
      >
        {content}
      </span>
    );
  }),
);

Avatar.displayName = 'Avatar';
