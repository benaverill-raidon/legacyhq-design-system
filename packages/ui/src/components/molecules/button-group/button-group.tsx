import * as React from 'react';
import styles from './button-group.module.css';
import type { ButtonGroupProps } from './button-group.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const ButtonGroup = React.memo(
  React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
    {
      children,
      orientation = 'horizontal',
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    forwardedRef,
  ) {
    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={mergeClassNames(styles.root, styles[`orientation_${orientation}`], className)}
        role={ariaLabel || ariaLabelledBy ? 'group' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-orientation={orientation}
      >
        {children}
      </div>
    );
  }),
);

ButtonGroup.displayName = 'ButtonGroup';
