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

    const hasLeading = isLoading || Boolean(iconBefore);

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
          isExpanded && styles.expanded,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        disabled={disabled}
        aria-busy={isLoading ? true : undefined}
        aria-disabled={isLoading ? true : undefined}
        aria-expanded={isExpanded != null ? isExpanded : undefined}
        data-loading={isLoading ? 'true' : undefined}
        data-full-width={isFullWidth ? 'true' : undefined}
        data-expanded={isExpanded ? 'true' : undefined}
        onClick={handleClick}
      >
        {hasLeading ? (
          <span className={styles.leading} aria-hidden={isLoading ? undefined : true}>
            {isLoading ? <Spinner size="sm" /> : iconBefore}
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

Button.displayName = 'Button';
