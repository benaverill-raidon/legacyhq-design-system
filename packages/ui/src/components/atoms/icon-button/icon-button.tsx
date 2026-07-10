import * as React from 'react';
import { Spinner } from '../spinner';
import { Tooltip } from '../tooltip';
import { useTooltipScope } from '../tooltip/tooltip-context';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './icon-button.module.css';
import type { IconButtonProps } from './icon-button.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function hasTooltipContent(content: React.ReactNode) {
  return React.Children.toArray(content).some((node) => {
    if (typeof node === 'string') {
      return node.trim().length > 0;
    }

    return node !== null && node !== undefined;
  });
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

function warnForImplicitTooltipWithAriaLabelledBy(
  tooltip: React.ReactNode | false | undefined,
  ariaLabel?: string,
  ariaLabelledBy?: string,
  insideTooltip?: boolean,
) {
  if (import.meta.env?.PROD) {
    return;
  }

  if (!ariaLabelledBy || ariaLabel || tooltip === false || tooltip !== undefined || insideTooltip) {
    return;
  }

  console.warn(
    'IconButton using `aria-labelledby` should provide `tooltip` explicitly or set `tooltip={false}` when no tooltip is desired.',
  );
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
      tooltip,
      tooltipPlacement = 'top',
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
    const insideTooltip = useTooltipScope();

    React.useEffect(() => {
      warnForMissingAccessibleName(ariaLabel, ariaLabelledBy);
    }, [ariaLabel, ariaLabelledBy]);

    React.useEffect(() => {
      warnForImplicitTooltipWithAriaLabelledBy(tooltip, ariaLabel, ariaLabelledBy, insideTooltip);
    }, [ariaLabel, ariaLabelledBy, insideTooltip, tooltip]);

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

    const button = (
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

    const resolvedTooltipContent = (() => {
      if (tooltip === false) {
        return false;
      }

      if (tooltip !== undefined) {
        return hasTooltipContent(tooltip) ? tooltip : false;
      }

      return typeof ariaLabel === 'string' && ariaLabel.trim().length > 0 ? ariaLabel : false;
    })();

    if (!resolvedTooltipContent || insideTooltip) {
      return button;
    }

    return (
      <Tooltip content={resolvedTooltipContent} placement={tooltipPlacement}>
        {button}
      </Tooltip>
    );
  }),
);

IconButton.displayName = 'IconButton';
