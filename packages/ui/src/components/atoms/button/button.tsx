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
      appearance = 'default',
      tone = 'neutral',
      isDisabled = false,
      isLoading = false,
      isFullWidth = false,
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
    const disabled = isDisabled;

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
          styles[`appearance_${appearance}`],
          styles[`tone_${tone}`],
          isFullWidth && styles.fullWidth,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        disabled={disabled}
        aria-busy={isLoading ? true : undefined}
        aria-disabled={isLoading ? true : undefined}
        data-loading={isLoading ? 'true' : undefined}
        data-full-width={isFullWidth ? 'true' : undefined}
        onClick={handleClick}
      >
        {hasLeading ? (
          <span className={styles.leading} aria-hidden={isLoading ? undefined : true}>
            {isLoading ? <Spinner size="sm" className={styles.spinner} /> : iconBefore}
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
