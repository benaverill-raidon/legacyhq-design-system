import * as React from 'react';
import { ChipSizeContext } from '../chip';
import styles from './chip-group.module.css';
import type { ChipGroupProps } from './chip-group.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const ChipGroup = React.memo(
  React.forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(
    {
      children,
      size,
      alignment = 'left',
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    forwardedRef,
  ) {
    const group = (
      <div
        {...rest}
        ref={forwardedRef}
        className={mergeClassNames(styles.root, styles[`alignment_${alignment}`], className)}
        /*
         * Only a named group is announced as one - an unnamed `role="group"` adds a boundary a
         * screen-reader user has to step through for no benefit. Same rule Button Group follows.
         */
        role={ariaLabel || ariaLabelledBy ? 'group' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-alignment={alignment}
        data-size={size}
      >
        {children}
      </div>
    );

    // Only mount a provider when there is actually a size to share, so a Chip Group without one
    // leaves every Chip on its own default rather than overriding it with undefined.
    return size ? <ChipSizeContext.Provider value={size}>{group}</ChipSizeContext.Provider> : group;
  }),
);

ChipGroup.displayName = 'ChipGroup';
