import * as React from 'react';

type AvatarBadgeIconProps = {
  className?: string;
};

export function AvatarStatusApprovedIcon({ className }: AvatarBadgeIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="9" fill="currentColor" />
      <path
        d="M13.6679 7.02162C13.8533 7.21619 13.8517 7.52254 13.6643 7.7152L8.63916 12.8814C8.43604 13.0902 8.09811 13.0819 7.90555 12.8632L5.01384 9.58034C4.84205 9.38531 4.84833 9.09117 5.02829 8.90365L6.0999 7.78702C6.3109 7.56716 6.66783 7.58556 6.8551 7.82596L7.80162 9.04102L8.26256 9.52539L11.8556 5.86856C12.0537 5.667 12.3793 5.66948 12.5742 5.87405L13.6679 7.02162Z"
        fill="var(--color-content-inverse)"
      />
    </svg>
  );
}
