import * as React from 'react';
import { ChipSizeContext } from '../chip';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { useFocusAfterRemoval } from '../../primitives/focus-after-removal';
import styles from './chip-group.module.css';
import type { ChipGroupAlignment, ChipGroupProps, DeprecatedChipGroupAlignment } from './chip-group.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

// `left` and `right` are the deprecated names for `start` and `end`, laid out the same.
const ALIGNMENTS: Record<ChipGroupAlignment | DeprecatedChipGroupAlignment, ChipGroupAlignment> = {
  start: 'start',
  end: 'end',
  left: 'start',
  right: 'end',
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

export const ChipGroup = React.memo(
  React.forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(
    {
      children,
      size,
      alignment: requestedAlignment = 'start',
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      onFocus,
      onBlur,
      onPointerDown,
      ...rest
    },
    forwardedRef,
  ) {
    const alignment = ALIGNMENTS[requestedAlignment] ?? 'start';
    // When a removed chip took focus with it, focus moves to the next chip, the previous one, or
    // this group (see primitives/focus-after-removal.ts).
    const removalFocus = useFocusAfterRemoval<HTMLDivElement>();
    const ref = React.useMemo(() => mergeRefs(forwardedRef, removalFocus.rootRef), [forwardedRef, removalFocus.rootRef]);

    const group = (
      <div
        {...rest}
        ref={ref}
        className={mergeClassNames(
          styles.root,
          styles[`alignment_${alignment}`],
          // Shown only if focus falls back to the group itself, once its last chip is removed.
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        onFocus={(event) => {
          onFocus?.(event);
          removalFocus.handleFocus(event);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          removalFocus.handleBlur();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          removalFocus.handlePointerDown(event);
        }}
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
