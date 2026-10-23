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
      spacing = 'default',
      className,
      role,
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
        className={mergeClassNames(
          styles.root,
          styles[`orientation_${orientation}`],
          spacing === 'compact' && styles.spacing_compact,
          className,
        )}
        // A role you pass, such as toolbar, wins; otherwise a named group is a `group`.
        role={role ?? (ariaLabel || ariaLabelledBy ? 'group' : undefined)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-orientation={orientation}
        data-spacing={spacing}
      >
        {children}
      </div>
    );
  }),
);

ButtonGroup.displayName = 'ButtonGroup';
