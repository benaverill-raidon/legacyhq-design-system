import * as React from 'react';
import { Spinner } from '../spinner';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './icon-button.module.css';
import type { IconButtonProps } from './icon-button.types';

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

  console.warn('IconButton requires either `aria-label` or `aria-labelledby` for an accessible name.');
}

export const IconButton = React.memo(
  React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    {
      appearance = 'default',
      size = 'md',
      shape = 'square',
      isDisabled = false,
      isLoading = false,
      isExpanded = false,
      className,
      children,
      type = 'button',
      onClick,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-expanded': ariaExpanded,
      ...rest
    },
    forwardedRef,
  ) {
    const disabled = isDisabled;

    React.useEffect(() => {
      warnForMissingAccessibleName(ariaLabel, ariaLabelledBy);
    }, [ariaLabel, ariaLabelledBy]);

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
          styles.root,
          styles[`appearance_${appearance}`],
          styles[`size_${size}`],
          styles[`shape_${shape}`],
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-expanded={isExpanded ? true : ariaExpanded}
        aria-busy={isLoading ? true : undefined}
        aria-disabled={isLoading ? true : undefined}
        data-loading={isLoading ? 'true' : undefined}
        data-expanded={isExpanded ? 'true' : undefined}
        onClick={handleClick}
      >
        <span className={styles.content} aria-hidden={isLoading ? undefined : true}>
          {isLoading ? <Spinner size="sm" className={styles.spinner} /> : children}
        </span>
      </button>
    );
  }),
);

IconButton.displayName = 'IconButton';
