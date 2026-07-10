import * as React from 'react';

type AvatarBadgeIconProps = {
  className?: string;
};

export function AvatarStatusDeclinedIcon({ className }: AvatarBadgeIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="9" fill="currentColor" />
      <path
        d="M12.6587 6.31646C12.8491 6.50685 12.8546 6.81382 12.671 7.01083L10.8184 8.99951L12.671 10.9882C12.8546 11.1852 12.8491 11.4922 12.6587 11.6826L11.5489 12.7924C11.3487 12.9926 11.0225 12.9868 10.8295 12.7797L9 10.8159L7.17049 12.7797C6.97753 12.9868 6.65126 12.9926 6.4511 12.7924L5.34126 11.6826C5.15086 11.4922 5.14543 11.1852 5.32897 10.9882L7.18164 8.99951L5.32897 7.01083C5.14543 6.81382 5.15086 6.50685 5.34126 6.31646L6.4511 5.20662C6.65126 5.00645 6.97753 5.01223 7.17049 5.21935L9 7.18311L10.8295 5.21935C11.0225 5.01223 11.3487 5.00645 11.5489 5.20662L12.6587 6.31646Z"
        fill="var(--color-content-inverse)"
      />
    </svg>
  );
}
