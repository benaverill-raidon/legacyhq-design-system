import * as React from 'react';
import styles from './empty-state.module.css';
import type { EmptyStateProps } from './empty-state.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const EmptyState = React.memo(
  React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
    { type = 'inherited', illustration, heading, children, actions, className, ...rest },
    forwardedRef,
  ) {
    const hasIllustration = illustration !== undefined && illustration !== null;
    const hasHeading = heading !== undefined && heading !== null;
    const hasActions = React.Children.toArray(actions).filter(Boolean).length > 0;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={mergeClassNames(styles.root, styles[`type_${type}`], className)}
      >
        {hasIllustration ? <div className={styles.illustration}>{illustration}</div> : null}

        <div className={styles.message}>
          {hasHeading ? <div className={styles.heading}>{heading}</div> : null}
          <div className={styles.description}>{children}</div>
          {hasActions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </div>
    );
  }),
);

EmptyState.displayName = 'EmptyState';
