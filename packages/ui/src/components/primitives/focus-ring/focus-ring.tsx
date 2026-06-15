import * as React from 'react';
import styles from './focus-ring.module.css';
import type { FocusRingBorderWidth, FocusRingProps } from './focus-ring.types';

export const focusRingClassNames = {
  focusRing: styles.focusRing,
  focusRingDefault: styles.focusRingDefault,
  focusRingCompact: styles.focusRingCompact,
  focusRingDisabled: styles.focusRingDisabled,
} as const;

function getBorderWidthClassName(borderWidth: FocusRingBorderWidth) {
  return borderWidth === 'compact' ? styles.focusRingCompact : styles.focusRingDefault;
}

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const FocusRing = React.memo(function FocusRing({
  children,
  borderWidth = 'default',
  className,
  disabled = false,
}: FocusRingProps) {
  const child = children as React.ReactElement<{ className?: string }>;
  const childClassName = typeof child.props.className === 'string' ? child.props.className : undefined;

  const focusRingClassName = disabled
    ? styles.focusRingDisabled
    : mergeClassNames(styles.focusRing, getBorderWidthClassName(borderWidth));

  return React.cloneElement(child, {
    className: mergeClassNames(childClassName, focusRingClassName, className),
  });
});

FocusRing.displayName = 'FocusRing';
