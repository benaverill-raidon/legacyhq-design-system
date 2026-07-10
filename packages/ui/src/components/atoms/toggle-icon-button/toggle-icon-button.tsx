import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './toggle-icon-button.module.css';
import type { ToggleIconButtonProps } from './toggle-icon-button.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function warnForMissingAccessibleName(ariaLabel?: string, ariaLabelledBy?: string) {
  if (import.meta.env?.PROD) {
    return;
  }

  if (ariaLabel || ariaLabelledBy) {
    return;
  }

  console.warn('ToggleIconButton requires either `aria-label` or `aria-labelledby` for an accessible name.');
}

export const ToggleIconButton = React.memo(
  React.forwardRef<HTMLButtonElement, ToggleIconButtonProps>(function ToggleIconButton(
    {
      size = 'md',
      tone = 'default',
      shape = 'square',
      isSelected = false,
      isDisabled = false,
      className,
      children,
      type = 'button',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    forwardedRef,
  ) {
    React.useEffect(() => {
      warnForMissingAccessibleName(ariaLabel, ariaLabelledBy);
    }, [ariaLabel, ariaLabelledBy]);

    return (
      <button
        {...rest}
        ref={forwardedRef}
        type={type}
        className={mergeClassNames(
          styles.root,
          styles[`size_${size}`],
          styles[`tone_${tone}`],
          styles[`shape_${shape}`],
          isSelected && styles.selected,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-pressed={isSelected}
        data-selected={isSelected ? 'true' : 'false'}
      >
        <span className={styles.content} aria-hidden="true">
          {children}
        </span>
      </button>
    );
  }),
);

ToggleIconButton.displayName = 'ToggleIconButton';
