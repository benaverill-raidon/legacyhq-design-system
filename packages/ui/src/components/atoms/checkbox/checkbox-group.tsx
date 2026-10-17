import * as React from 'react';
import { Checkbox } from './checkbox';
import { CheckboxGroupContext } from './checkbox-group-context';
import styles from './checkbox.module.css';
import type { CheckboxGroupProps } from './checkbox.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const CheckboxGroup = React.memo(function CheckboxGroup({
  label,
  description,
  errorMessage,
  name,
  value,
  defaultValue,
  options,
  children,
  required = false,
  requiredLabel = 'required',
  invalid = false,
  disabled = false,
  orientation = 'vertical',
  onValueChange,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CheckboxGroupProps) {
  const generatedName = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();
  const groupName = name ?? generatedName;
  const describedBy = [ariaDescribedBy, description ? descriptionId : undefined, errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(' ');
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue ?? []);
  const currentValue = isControlled ? value : internalValue;
  const context = React.useMemo(() => ({ disabled }), [disabled]);

  const handleCheckedChange = React.useCallback(
    (optionValue: string, checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => {
      const next = checked ? [...currentValue, optionValue] : currentValue.filter((v) => v !== optionValue);

      if (!isControlled) {
        setInternalValue(next);
      }

      onValueChange?.(next, event);
    },
    [currentValue, isControlled, onValueChange],
  );

  const renderedOptions = options?.map((option) => (
    <Checkbox
      key={option.value}
      name={groupName}
      value={option.value}
      label={option.label}
      checked={isControlled ? currentValue.includes(option.value) : undefined}
      defaultChecked={!isControlled ? (defaultValue ?? []).includes(option.value) : undefined}
      disabled={option.disabled}
      invalid={invalid || option.invalid}
      required={option.required}
      aria-describedby={describedBy || undefined}
      onCheckedChange={(checked, event) => handleCheckedChange(option.value, checked, event)}
    />
  ));

  return (
    <fieldset
      {...rest}
      id={id}
      className={mergeClassNames(styles.group, styles[`orientation_${orientation}`], className)}
      disabled={disabled}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy || undefined}
      data-invalid={invalid ? 'true' : undefined}
    >
      {label !== undefined ? (
        <legend className={styles.legend}>
          {label}
          {/*
            Checkboxes have no native group-level requirement, so the legend says it in words for
            assistive technology; the `*` is only visual.
          */}
          {required ? (
            <>
              <span className={styles.requiredIndicator} aria-hidden="true">
                *
              </span>
              {/* A flex container doesn't render this space, but it separates the label in the name. */}{' '}
              <span className={styles.visuallyHidden}>{requiredLabel}</span>
            </>
          ) : null}
        </legend>
      ) : null}
      {description ? (
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      ) : null}
      <CheckboxGroupContext.Provider value={context}>
        <div className={styles.options}>{renderedOptions ?? children}</div>
      </CheckboxGroupContext.Provider>
      {errorMessage ? (
        <div id={errorId} className={styles.errorMessage}>
          {errorMessage}
        </div>
      ) : null}
    </fieldset>
  );
});

CheckboxGroup.displayName = 'CheckboxGroup';
