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

type AvatarBadgePresence = Exclude<AvatarPresence, 'none'>;
type AvatarBadgeStatus = Exclude<AvatarStatus, 'none'>;

// The English defaults for the words Avatar adds to its accessible name; each is a prop for translation.
const DEFAULT_SELECTED_LABEL = 'selected';

const PRESENCE_LABELS: Record<AvatarBadgePresence, string> = {
  online: 'online',
  offline: 'offline',
  busy: 'busy',
};

const STATUS_LABELS: Record<AvatarBadgeStatus, string> = {
  accepted: 'accepted',
  declined: 'declined',
};

function getDefaultAvatarPresenceLabel(presence: AvatarBadgePresence) {
  return PRESENCE_LABELS[presence];
}

function getDefaultAvatarStatusLabel(status: AvatarBadgeStatus) {
  return STATUS_LABELS[status];
}

function getVisibleBadge(status: AvatarStatus, presence: AvatarPresence) {
  return status !== 'none' ? status : presence;
}

function getAccessibleLabel({
  ariaLabel,
  ariaLabelledBy,
  alt,
  decorative,
  isButton,
  announceSelected,
  name,
  presence,
  status,
  selectedLabel,
  getPresenceLabel,
  getStatusLabel,
}: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  alt?: string;
  decorative: boolean;
  isButton: boolean;
  announceSelected: boolean;
  name?: string;
  presence: AvatarPresence;
  status: AvatarStatus;
  selectedLabel: string;
  getPresenceLabel: (presence: AvatarBadgePresence) => string;
  getStatusLabel: (status: AvatarBadgeStatus) => string;
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

  if (announceSelected) {
    details.push(selectedLabel);
  }

  if (status !== 'none') {
    details.push(getStatusLabel(status));
  } else if (presence !== 'none') {
    details.push(getPresenceLabel(presence));
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
      isSelected,
      disabled,
      isDisabled: deprecatedIsDisabled,
      isInteractive = false,
      decorative = false,
      entityType = 'person',
      className,
      onClick,
      type = 'button',
      selectedLabel = DEFAULT_SELECTED_LABEL,
      getPresenceLabel = getDefaultAvatarPresenceLabel,
      getStatusLabel = getDefaultAvatarStatusLabel,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-pressed': ariaPressed,
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
    // `isDisabled` is the deprecated name for `disabled`.
    const isDisabled = disabled ?? deprecatedIsDisabled ?? false;
    const selected = isSelected ?? false;
    // An interactive avatar given `isSelected` is a toggle: the button carries the state in
    // aria-pressed, so "selected" isn't repeated in its name. A static avatar (role="img") can't carry
    // a pressed state, so it keeps the word.
    const pressed = isButton && isSelected !== undefined ? isSelected : undefined;
    const decorativeAvatar = decorative && !isButton;
    const visibleBadge = getVisibleBadge(status, presence);
    const computedLabel = getAccessibleLabel({
      ariaLabel,
      ariaLabelledBy,
      alt,
      decorative: decorativeAvatar,
      isButton,
      announceSelected: selected && pressed === undefined,
      name,
      presence,
      status,
      selectedLabel,
      getPresenceLabel,
      getStatusLabel,
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
          aria-pressed={pressed ?? ariaPressed}
          data-size={size}
          data-interactive="true"
          data-selected={selected ? 'true' : undefined}
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
        data-selected={selected ? 'true' : undefined}
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
