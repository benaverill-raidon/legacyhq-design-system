import * as React from 'react';
import styles from './button.module.css';
import type { ButtonOwnerState } from './types';

export function ButtonContent({
  owner,
  iconBefore,
  iconAfter,
  children,
}: {
  owner: ButtonOwnerState;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <span className={styles.content}>
      {/* Spinner overlay: keeps layout stable while showing a busy affordance. */}
      {owner.loading && <span className={styles.spinner} aria-hidden="true" />}

      {iconBefore && <span className={styles.iconSlotBefore}>{iconBefore}</span>}

      {children && <span className={styles.label}>{children}</span>}

      {iconAfter && <span className={styles.iconSlotAfter}>{iconAfter}</span>}
    </span>
  );
}
