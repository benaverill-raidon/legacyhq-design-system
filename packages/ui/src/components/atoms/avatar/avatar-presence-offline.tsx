import * as React from 'react';

type AvatarBadgeIconProps = {
  className?: string;
};

export function AvatarPresenceOfflineIcon({ className }: AvatarBadgeIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="9" fill="currentColor" />
      <path d="M9 12.5C10.933 12.5 12.5 10.933 12.5 9C12.5 7.067 10.933 5.5 9 5.5C7.067 5.5 5.5 7.067 5.5 9C5.5 10.933 7.067 12.5 9 12.5Z" fill="var(--color-content-inverse)" />
    </svg>
  );
}
