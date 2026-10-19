import * as React from 'react';
import { Spinner } from '../spinner';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './button.module.css';
import type { ButtonProps } from './button.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
      size = 'md',
      prominence = 'secondary',
      tone = 'default',
      isInverse = false,
      disabled = false,
      isLoading = false,
      isFullWidth = false,
      isExpanded,
      iconBefore,
      iconAfter,
      children,
      className,
      type = 'button',
      onClick,
      'aria-expanded': ariaExpanded,
      ...rest
    },
    forwardedRef,
  ) {
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClick?.(event);
      },
      [disabled, isLoading, onClick],
    );

    return (
      <button
        {...rest}
        ref={forwardedRef}
        type={type}
        className={mergeClassNames(
          styles.button,
          styles[`size_${size}`],
          styles[`prominence_${prominence}`],
          styles[`tone_${tone}`],
          isInverse && styles.inverse,
          isFullWidth && styles.fullWidth,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        disabled={disabled}
        aria-busy={isLoading ? true : undefined}
        aria-disabled={isLoading ? true : undefined}
        // isExpanded wins; without it, an aria-expanded a wrapper passes (Popup does) stays.
        aria-expanded={isExpanded != null ? isExpanded : ariaExpanded}
        data-loading={isLoading ? 'true' : undefined}
        data-full-width={isFullWidth ? 'true' : undefined}
        data-expanded={(isExpanded ?? (ariaExpanded === true || ariaExpanded === 'true')) ? 'true' : undefined}
        onClick={handleClick}
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

        {/* While loading, the spinner sits over the content, which keeps its space and stays the accessible name. */}
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true">
            <Spinner size="md" />
          </span>
        ) : null}
      </button>
    );
  }),
);

Button.displayName = 'Button';
