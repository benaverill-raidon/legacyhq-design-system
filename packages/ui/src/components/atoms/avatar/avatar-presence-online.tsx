import * as React from 'react';

type AvatarBadgeIconProps = {
  className?: string;
};

export function AvatarPresenceOnlineIcon({ className }: AvatarBadgeIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="9" fill="currentColor" />
    </svg>
  );
}
