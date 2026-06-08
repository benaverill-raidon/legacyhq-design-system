import * as React from 'react';
import styles from './spinner.module.css';
import type { SpinnerProps } from './spinner.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const Spinner = React.memo(function Spinner({
  size = 'lg',
  label,
  className,
  ...rest
}: SpinnerProps) {
  const hasLabel = Boolean(label);
  const classNames = mergeClassNames(styles.spinner, styles[`size_${size}`], className);

  return (
    <span
      {...rest}
      className={classNames}
      role={hasLabel ? 'status' : undefined}
      aria-live={hasLabel ? 'polite' : undefined}
      aria-hidden={hasLabel ? undefined : true}
    >
      <svg className={styles.svg} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path className={styles.arc} d="M12 3a9 9 0 0 0-9 9" />
      </svg>
      {hasLabel ? <span className={styles.visuallyHidden}>{label}</span> : null}
    </span>
  );
});

Spinner.displayName = 'Spinner';
