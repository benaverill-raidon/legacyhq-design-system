import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './radio.module.css';
import type { RadioProps } from './radio.types';

type InternalRadioProps = RadioProps & {
  showRequiredIndicator?: boolean;
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function setRefs<T>(node: T, ...refs: Array<React.ForwardedRef<T>>) {
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  });
}

export const Radio = React.memo(
  React.forwardRef<HTMLInputElement, InternalRadioProps>(function Radio(
    {
      label,
      checked,
      defaultChecked,
      invalid = false,
      required = false,
      disabled = false,
      className,
      inputClassName,
      showRequiredIndicator = true,
      onCheckedChange,
      id,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(event.target.checked, event);
      },
      [onCheckedChange],
    );

    return (
      <label
        className={mergeClassNames(styles.radio, className)}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={invalid ? 'true' : undefined}
      >
        <span className={styles.control}>
          <input
            {...rest}
            ref={(node) => setRefs(node, forwardedRef)}
            id={inputId}
            className={mergeClassNames(
              styles.input,
              focusRingClassNames.focusRing,
              focusRingClassNames.focusRingDefault,
              inputClassName,
            )}
            type="radio"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            required={required}
            aria-invalid={invalid ? true : ariaInvalid}
            onChange={handleChange}
          />
          <span className={styles.indicator} aria-hidden="true" />
        </span>

        {label !== undefined ? (
          <span className={styles.labelText}>
            {label}
            {required && showRequiredIndicator ? <span className={styles.requiredIndicator}>*</span> : null}
          </span>
        ) : null}
      </label>
    );
  }),
);

Radio.displayName = 'Radio';
