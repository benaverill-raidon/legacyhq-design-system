import * as React from 'react';
import { CheckboxEmptyIcon, CheckboxFillIcon, CheckboxIndeterminateIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { CheckboxGroupContext } from './checkbox-group-context';
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
      invalid: invalidProp = false,
      errorMessage,
      disabled = false,
      required = false,
      className,
      onCheckedChange,
      id,
      'aria-checked': ariaChecked,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    // An error message marks the checkbox invalid too, and describes it after any description it has.
    const hasError = errorMessage !== undefined && errorMessage !== null && errorMessage !== false;
    const invalid = invalidProp || hasError;
    const describedBy = [ariaDescribedBy, hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    // A disabled Checkbox Group disables every checkbox inside it, from `options` or `children`.
    const group = React.useContext(CheckboxGroupContext);
    const isDisabled = disabled || group.disabled;
    // Documentation-only, forwarded to `.input` as-is via `...rest`; read here only to also apply
    // it to the root label, since hover/press styling keys off the label rather than the input.
    const dataForceState = (rest as { 'data-force-state'?: string })['data-force-state'];

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

    const checkbox = (
      <label
        className={mergeClassNames(styles.root, hasError ? undefined : className)}
        data-disabled={isDisabled ? 'true' : undefined}
        data-indeterminate={indeterminate ? 'true' : undefined}
        data-invalid={invalid ? 'true' : undefined}
        data-force-state={dataForceState}
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
            disabled={isDisabled}
            required={required}
            aria-invalid={invalid ? true : ariaInvalid}
            aria-describedby={describedBy}
            aria-checked={indeterminate ? 'mixed' : ariaChecked}
            onChange={handleChange}
          />
          <span className={styles.indicatorTarget} aria-hidden="true">
            <span className={styles.indicatorFocus}>
              <CheckboxEmptyIcon
                className={mergeClassNames(styles.indicatorIcon, styles.uncheckedIcon)}
                decorative
                testId="checkbox-empty-icon"
              />
              <CheckboxFillIcon
                className={mergeClassNames(styles.indicatorIcon, styles.selectedIcon, styles.checkedIcon)}
                decorative
                testId="checkbox-fill-icon"
              />
              <CheckboxIndeterminateIcon
                className={mergeClassNames(styles.indicatorIcon, styles.selectedIcon, styles.indeterminateIcon)}
                decorative
                testId="checkbox-indeterminate-icon"
              />
            </span>
          </span>
        </span>

        {label !== undefined ? (
          <span className={styles.labelText}>
            {label}
            {/* Decorative: the native `required` is what assistive technology announces. */}
            {required ? (
              <span className={styles.requiredIndicator} aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );

    if (!hasError) {
      return checkbox;
    }

    // The message sits outside the label, so it describes the checkbox without becoming part of its name.
    return (
      <div className={mergeClassNames(styles.field, className)}>
        {checkbox}
        <div id={errorId} className={styles.errorMessage}>
          {errorMessage}
        </div>
      </div>
    );
  }),
);

Checkbox.displayName = 'Checkbox';