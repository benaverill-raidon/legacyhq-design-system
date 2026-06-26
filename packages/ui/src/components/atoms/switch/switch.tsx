import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './switch.module.css';
import type { SwitchProps } from './switch.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const Switch = React.memo(
  React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
    {
      label,
      size = 'md',
      checked,
      defaultChecked,
      disabled = false,
      required = false,
      className,
      onCheckedChange,
      id,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.currentTarget.disabled) {
          return;
        }

        onCheckedChange?.(event.target.checked, event);
      },
      [onCheckedChange],
    );

    return (
      <label
        className={mergeClassNames(styles.root, styles[`size_${size}`], className)}
        htmlFor={inputId}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.control}>
          <input
            {...rest}
            ref={forwardedRef}
            id={inputId}
            className={mergeClassNames(
              styles.input,
              focusRingClassNames.focusRing,
              focusRingClassNames.focusRingDefault,
            )}
            type="checkbox"
            role="switch"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            required={required}
            onChange={handleChange}
          />
          <span className={styles.indicator} aria-hidden="true">
            <span className={mergeClassNames(styles.icon, styles.iconOn)} />
            <span className={mergeClassNames(styles.icon, styles.iconOff)} />
            <span className={styles.thumb} />
          </span>
        </span>

        {label !== undefined ? (
          <span className={styles.labelText}>
            {label}
            {required ? <span className={styles.requiredIndicator}>*</span> : null}
          </span>
        ) : null}
      </label>
    );
  }),
);

Switch.displayName = 'Switch';

