import * as React from 'react';
import { useEditableCellSize } from '../../primitives/editable-cell-context';
import styles from './text-field.module.css';
import type { TextFieldProps } from './text-field.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const TextField = React.memo(
  React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
    {
      size = 'md',
      appearance = 'default',
      invalid = false,
      iconBefore,
      leadingContent,
      iconAfter,
      className,
      inputClassName,
      disabled,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    forwardedRef,
  ) {
    const cellSize = useEditableCellSize();
    if (cellSize) {
      size = cellSize;
      appearance = 'subtle';
    }
    // Documentation-only, forwarded to `.input` as-is via `...rest`; read here only to also apply
    // it to the root frame, since hover/focus styling keys off the frame rather than the input.
    const dataForceState = (rest as { 'data-force-state'?: string })['data-force-state'];

    return (
      // The input supplies keyboard interaction; delegate clicks on cell padding/glyphs to it.
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
      <div
        className={mergeClassNames(
          styles.root,
          styles[`size_${size}`],
          styles[`appearance_${appearance}`],
          className,
        )}
        data-size={size}
        data-appearance={appearance}
        data-editable-cell={cellSize ?? undefined}
        data-invalid={invalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-force-state={dataForceState}
        onClick={cellSize ? (event) => {
          if (disabled || (event.target as HTMLElement).closest('input, button, a')) return;
          const input = event.currentTarget.querySelector('input');
          input?.focus();
          input?.click();
        } : undefined}
      >
        {iconBefore ? (
          <span className={styles.before} aria-hidden="true">
            {iconBefore}
          </span>
        ) : null}

        {/* Interactive in-frame content (e.g. Select's chips) - not aria-hidden, shrinks/clips so the input stays visible. */}
        {leadingContent ? <span className={styles.leadingContent}>{leadingContent}</span> : null}

        <input
          {...rest}
          ref={forwardedRef}
          className={mergeClassNames(styles.input, inputClassName)}
          disabled={disabled}
          aria-invalid={invalid ? true : ariaInvalid}
        />

        {/* Not aria-hidden: this slot holds an interactive IconButton/Button (e.g. a clear action), unlike the decorative-only `iconBefore` slot. */}
        {iconAfter ? <span className={styles.action}>{iconAfter}</span> : null}
      </div>
    );
  }),
);

TextField.displayName = 'TextField';
