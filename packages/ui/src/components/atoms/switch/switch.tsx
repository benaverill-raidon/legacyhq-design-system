import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Spinner } from '../spinner';
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
      isLoading = false,
      className,
      onCheckedChange,
      onClick,
      id,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    // Documentation-only, forwarded to `.input` as-is via `...rest`; read here only to also apply
    // it to the root label, since hover/pressed styling keys off the label rather than the input.
    const dataForceState = (rest as { 'data-force-state'?: string })['data-force-state'];

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.currentTarget.disabled || isLoading) {
          return;
        }

        onCheckedChange?.(event.target.checked, event);
      },
      [isLoading, onCheckedChange],
    );

    /*
     * A native checkbox toggles its own checked state on click/Space before onChange ever fires,
     * so blocking the change there alone isn't enough - isLoading has no native disabled attribute
     * backing it (that would drop the control from the tab order, unlike Figma's isLoading, which
     * stays interactive-looking), so the toggle itself is prevented here instead.
     */
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement>) => {
        if (isLoading) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      },
      [isLoading, onClick],
    );

    return (
      <label
        className={mergeClassNames(styles.root, styles[`size_${size}`], className)}
        htmlFor={inputId}
        data-disabled={disabled ? 'true' : undefined}
        data-loading={isLoading ? 'true' : undefined}
        data-force-state={dataForceState}
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
            aria-busy={isLoading ? true : undefined}
            onChange={handleChange}
            onClick={handleClick}
          />
          <span className={styles.indicator} aria-hidden="true">
            <span className={mergeClassNames(styles.icon, styles.iconOn)}>
              {isLoading ? <Spinner size="sm" /> : null}
            </span>
            <span className={mergeClassNames(styles.icon, styles.iconOff)}>
              {isLoading ? <Spinner size="sm" /> : null}
            </span>
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

