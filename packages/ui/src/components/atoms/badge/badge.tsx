import * as React from 'react';
import styles from './badge.module.css';
import type { BadgeProps } from './badge.types';

export const Badge = React.memo(function Badge({
  children,
  tone = 'default',
  label,
  ariaLabel,
  className,
  ...rest
}: BadgeProps) {
  const classNames = [styles.badge, styles[`tone_${tone}`], className].filter(Boolean).join(' ');
  // `ariaLabel` is the deprecated name for `label`. A span with no role can't take an aria-label
  // (screen readers may skip it), so the words are hidden text and the visible value is hidden instead.
  const textAlternative = label ?? ariaLabel;

  return (
    <span {...rest} className={classNames} data-tone={tone}>
      {textAlternative ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className={styles.visuallyHidden}>{textAlternative}</span>
        </>
      ) : (
        children
      )}
    </span>
  );
});

Badge.displayName = 'Badge';
