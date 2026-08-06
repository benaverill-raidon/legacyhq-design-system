import * as React from 'react';
import styles from './skeleton.module.css';
import type { SkeletonProps } from './skeleton.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const Skeleton = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
    { appearance = 'subtle', shape = 'rectangle', label, className, ...rest },
    forwardedRef,
  ) {
    const hasLabel = Boolean(label);
    const classNames = mergeClassNames(
      styles.root,
      styles[`appearance_${appearance}`],
      styles[`shape_${shape}`],
      className,
    );

    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={classNames}
        role={hasLabel ? 'status' : undefined}
        aria-live={hasLabel ? 'polite' : undefined}
        aria-hidden={hasLabel ? undefined : true}
        data-appearance={appearance}
        data-shape={shape}
      >
        {hasLabel ? <span className={styles.visuallyHidden}>{label}</span> : null}
      </div>
    );
  }),
);

Skeleton.displayName = 'Skeleton';
