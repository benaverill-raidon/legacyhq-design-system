import * as React from 'react';
import { Radio } from './radio';
import styles from './radio.module.css';
import type { RadioGroupProps } from './radio.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const RadioGroup = React.memo(function RadioGroup({
  label,
  description,
  errorMessage,
  name,
  value,
  defaultValue,
  options,
  children,
  required = false,
  invalid = false,
  disabled = false,
  orientation = 'vertical',
  onValueChange,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: RadioGroupProps) {
  const generatedName = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();
  const groupName = name ?? generatedName;
  const describedBy = [ariaDescribedBy, description ? descriptionId : undefined, errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(' ');
  const isControlled = value !== undefined;

  const handleCheckedChange = React.useCallback(
    (optionValue: string, checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => {
      if (checked) {
        onValueChange?.(optionValue, event);
      }
    },
    [onValueChange],
  );

  const renderedOptions = options?.map((option) => (
    <Radio
      key={option.value}
      name={groupName}
      value={option.value}
      label={option.label}
      checked={isControlled ? value === option.value : undefined}
      defaultChecked={!isControlled ? defaultValue === option.value : undefined}
      disabled={disabled || option.disabled}
      invalid={invalid || option.invalid}
      required={required || option.required}
      showRequiredIndicator={Boolean(option.required)}
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
          {required ? <span className={styles.requiredIndicator}>*</span> : null}
        </legend>
      ) : null}
      {description ? (
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      ) : null}
      <div className={styles.options}>{renderedOptions ?? children}</div>
      {errorMessage ? (
        <div id={errorId} className={styles.errorMessage}>
          {errorMessage}
        </div>
      ) : null}
    </fieldset>
  );
});

RadioGroup.displayName = 'RadioGroup';
