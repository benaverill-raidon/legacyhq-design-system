import * as React from 'react';
import styles from './card.module.css';
import type { CardProps } from './card.types';

/** An optional surface and border with rounded, clipped corners around arbitrary content. */
export const Card = React.memo(
  React.forwardRef<HTMLDivElement, CardProps>(function Card(
    { surface = 'raised', border = true, borderRadius = 'lg', children, className, ...rest },
    forwardedRef,
  ) {
    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-surface={surface}
        data-border={border ? 'true' : 'false'}
        data-border-radius={borderRadius}
      >
        {children}
      </div>
    );
  }),
);

Card.displayName = 'Card';
