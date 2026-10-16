import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './toggle-button.module.css';
import type { ToggleButtonProps } from './toggle-button.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const ToggleButton = React.memo(
  React.forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
    {
      size = 'md',
      tone = 'default',
      isSelected = false,
      disabled: requestedDisabled,
      isDisabled,
      iconBefore,
      iconAfter,
      children,
      className,
      type = 'button',
      ...rest
    },
    forwardedRef,
  ) {
    // `isDisabled` is the deprecated name for the native `disabled`.
    const disabled = requestedDisabled ?? isDisabled ?? false;

    return (
      <button
        {...rest}
        ref={forwardedRef}
        type={type}
        className={mergeClassNames(
          styles.toggleButton,
          styles[`size_${size}`],
          styles[`tone_${tone}`],
          isSelected && styles.selected,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        disabled={disabled}
        aria-pressed={isSelected}
        data-selected={isSelected ? 'true' : 'false'}
      >
        {iconBefore ? (
          <span className={styles.leading} aria-hidden="true">
            {iconBefore}
          </span>
        ) : null}

        <span className={styles.content}>{children}</span>

        {iconAfter ? (
          <span className={styles.trailing} aria-hidden="true">
            {iconAfter}
          </span>
        ) : null}
      </button>
    );
  }),
);

ToggleButton.displayName = 'ToggleButton';
