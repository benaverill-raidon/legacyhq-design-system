import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './checkbox.module.css';
import type { CheckboxProps } from './checkbox.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function setRefs<T>(node: T, ...refs: Array<React.ForwardedRef<T> | React.MutableRefObject<T | null>>) {
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  });
}

export const Checkbox = React.memo(
  React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    {
      label,
      checked,
      defaultChecked,
      indeterminate = false,
      invalid = false,
      disabled = false,
      required = false,
      className,
      onCheckedChange,
      id,
      'aria-checked': ariaChecked,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(event.target.checked, event);
      },
      [onCheckedChange],
    );

    return (
      <label
        className={mergeClassNames(styles.root, className)}
        data-disabled={disabled ? 'true' : undefined}
        data-indeterminate={indeterminate ? 'true' : undefined}
        data-invalid={invalid ? 'true' : undefined}
      >
        <span className={styles.control}>
          <input
            {...rest}
            ref={(node) => setRefs(node, inputRef, forwardedRef)}
            id={inputId}
            className={mergeClassNames(
              styles.input,
              focusRingClassNames.focusRing,
              focusRingClassNames.focusRingDefault,
            )}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            required={required}
            aria-invalid={invalid ? true : ariaInvalid}
            aria-checked={indeterminate ? 'mixed' : ariaChecked}
            onChange={handleChange}
          />
          <span className={styles.indicator} aria-hidden="true" />
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

Checkbox.displayName = 'Checkbox';
