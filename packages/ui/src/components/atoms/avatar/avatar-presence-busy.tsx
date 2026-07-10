import * as React from 'react';

type AvatarBadgeIconProps = {
  className?: string;
};

export function AvatarPresenceBusyIcon({ className }: AvatarBadgeIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="9" fill="currentColor" />
      <path
        d="M13.5 10C13.5 10.5523 13.0523 11 12.5 11H5.5C4.94772 11 4.5 10.5523 4.5 10V8C4.5 7.44772 4.94772 7 5.5 7H12.5C13.0523 7 13.5 7.44772 13.5 8V10Z"
        fill="var(--color-content-inverse)"
      />
    </svg>
  );
}
