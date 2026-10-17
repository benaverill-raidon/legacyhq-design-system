import * as React from 'react';
import styles from './empty-state.module.css';
import type { EmptyStateAppearance, EmptyStateProps } from './empty-state.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const EmptyState = React.memo(
  React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
    { appearance: requestedAppearance, type, illustration, heading, headingLevel = 2, children, actions, className, ...rest },
    forwardedRef,
  ) {
    // `type` is the deprecated name for `appearance`.
    const appearance: EmptyStateAppearance = requestedAppearance ?? type ?? 'inherited';
    const Heading = `h${headingLevel}` as const;
    const hasIllustration = illustration !== undefined && illustration !== null;
    const hasHeading = heading !== undefined && heading !== null;
    const hasActions = React.Children.toArray(actions).filter(Boolean).length > 0;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={mergeClassNames(styles.root, styles[`appearance_${appearance}`], className)}
      >
        {hasIllustration ? <div className={styles.illustration}>{illustration}</div> : null}

        <div className={styles.message}>
          {hasHeading ? <Heading className={styles.heading}>{heading}</Heading> : null}
          <div className={styles.description}>{children}</div>
          {hasActions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </div>
    );
  }),
);

EmptyState.displayName = 'EmptyState';
