import * as React from 'react';
import styles from './text-area.module.css';
import type { TextAreaProps } from './text-area.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Text Area is the multi-line sibling of Text Field: a real native `<textarea>` inside a bordered
 * frame. Unlike Text Field it has no leading/trailing icon slots (Figma's own text-area is just the
 * frame plus the text), so the frame styling lives directly on the `<textarea>` element rather than
 * on a wrapper - which also lets the browser's native resize grip work without any extra wiring.
 */
export const TextArea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
    { size = 'md', appearance = 'default', invalid = false, resize = 'vertical', className, disabled, 'aria-invalid': ariaInvalid, ...rest },
    forwardedRef,
  ) {
    return (
      <textarea
        {...rest}
        ref={forwardedRef}
        className={mergeClassNames(
          styles.textarea,
          styles[`size_${size}`],
          styles[`appearance_${appearance}`],
          styles[`resize_${resize}`],
          className,
        )}
        data-size={size}
        data-appearance={appearance}
        data-invalid={invalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        disabled={disabled}
        aria-invalid={invalid ? true : ariaInvalid}
      />
    );
  }),
);

TextArea.displayName = 'TextArea';
