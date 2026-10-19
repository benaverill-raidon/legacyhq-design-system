import * as React from 'react';
import { RadioCheckedIcon, RadioUncheckedIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { RadioGroupContext } from './radio-group-context';
import styles from './radio.module.css';
import type { RadioProps } from './radio.types';

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
  React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
    {
      label,
      checked,
      defaultChecked,
      invalid = false,
      required = false,
      disabled = false,
      className,
      inputClassName,
      onCheckedChange,
      id,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    // A Radio Group's `disabled` and `required` reach every radio inside it, from `options` or
    // `children`. Group-level `required` is native only: the group shows the one `*`, on its legend.
    const group = React.useContext(RadioGroupContext);
    const isDisabled = disabled || group.disabled;
    const isRequired = required || group.required;

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(event.target.checked, event);
      },
      [onCheckedChange],
    );

    return (
      <label
        className={mergeClassNames(styles.radio, className)}
        data-disabled={isDisabled ? 'true' : undefined}
        data-invalid={invalid ? 'true' : undefined}
      >
        <span className={styles.control}>
          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props -- aria-invalid is a
              global ARIA state supported on every role since ARIA 1.2; this rule's role/property
              table predates that and still flags it on role=radio. */}
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
            disabled={isDisabled}
            required={isRequired}
            aria-invalid={invalid ? true : ariaInvalid}
            onChange={handleChange}
          />
          <span className={styles.indicatorTarget} aria-hidden="true">
            <span className={styles.indicatorFocus}>
              <RadioUncheckedIcon
                className={mergeClassNames(styles.indicatorIcon, styles.uncheckedIcon)}
                decorative
                testId="radio-unchecked-icon"
              />
              <RadioCheckedIcon
                className={mergeClassNames(styles.indicatorIcon, styles.checkedIcon)}
                decorative
                testId="radio-checked-icon"
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
  }),
);

Radio.displayName = 'Radio';