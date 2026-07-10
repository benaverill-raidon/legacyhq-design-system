import * as React from 'react';
import styles from './badge.module.css';
import type { BadgeProps } from './badge.types';

export const Badge = React.memo(function Badge({
  children,
  tone = 'default',
  ariaLabel,
  className,
}: BadgeProps) {
  const classNames = [styles.badge, styles[`tone_${tone}`], className].filter(Boolean).join(' ');

  return (
    <span className={classNames} aria-label={ariaLabel} data-tone={tone}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

