import * as React from 'react';
import styles from './text-area.module.css';
import type { TextAreaProps } from './text-area.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Text Area is the multi-line sibling of Text Field: a real native `<textarea>` inside a bordered
 * frame. The frame styling lives on a wrapper `<div>` (the same pattern Text Field uses) so it can
 * host an optional trailing icon/action slot (`iconAfter`). The ref forwards to the `<textarea>`.
 */
export const TextArea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
    { size = 'md', appearance = 'default', invalid = false, resize = 'vertical', autoResize = false, maxRows = 6, iconAfter, className, disabled, 'aria-invalid': ariaInvalid, ...rest },
    forwardedRef,
  ) {
    const dataForceState = (rest as { 'data-force-state'?: string })['data-force-state'];
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(forwardedRef, () => textareaRef.current!, []);

    const resizeToContent = React.useCallback(() => {
      const field = textareaRef.current;
      if (!autoResize || !field) return;
      const lineHeight = Number.parseFloat(getComputedStyle(field).lineHeight);
      if (!Number.isFinite(lineHeight)) return;
      const limit = Number.isFinite(maxRows) ? Math.max(1, Math.floor(maxRows)) : 6;
      const scrollTop = field.scrollTop;
      // Measure without the previous height or scrollbar so deleting text also shrinks the field.
      field.style.height = '0px';
      field.style.overflowY = 'hidden';
      const contentHeight = field.scrollHeight;
      const height = Math.max(lineHeight, Math.min(contentHeight, lineHeight * limit));
      field.style.height = `${height}px`;
      field.style.overflowY = contentHeight > height ? 'auto' : 'hidden';
      field.scrollTop = scrollTop;
    }, [autoResize, maxRows]);

    React.useLayoutEffect(() => {
      const field = textareaRef.current;
      if (!autoResize || !field) return;
      const originalHeight = field.style.height;
      const originalOverflow = field.style.overflowY;
      resizeToContent();
      let width = field.getBoundingClientRect().width;
      const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => {
        const nextWidth = field.getBoundingClientRect().width;
        if (nextWidth !== width) {
          width = nextWidth;
          resizeToContent();
        }
      });
      observer?.observe(field);
      let active = true;
      void document.fonts?.ready.then(() => { if (active) resizeToContent(); });
      return () => {
        active = false;
        observer?.disconnect();
        field.style.height = originalHeight;
        field.style.overflowY = originalOverflow;
      };
    }, [autoResize, resizeToContent]);

    // Includes controlled value updates, cancellation, and changes to size or available content space.
    React.useLayoutEffect(() => { resizeToContent(); });

    return (
      <div
        className={mergeClassNames(
          styles.root,
          styles[`size_${size}`],
          styles[`appearance_${appearance}`],
          styles[`resize_${resize}`],
          autoResize && styles.auto_resize,
          className,
        )}
        data-size={size}
        data-appearance={appearance}
        data-invalid={invalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-force-state={dataForceState}
      >
        <textarea
          {...rest}
          ref={textareaRef}
          rows={autoResize ? 1 : rest.rows}
          onInput={(event) => {
            rest.onInput?.(event);
            resizeToContent();
          }}
          className={styles.textarea}
          disabled={disabled}
          aria-invalid={invalid ? true : ariaInvalid}
        />

        {iconAfter ? <span className={styles.action}>{iconAfter}</span> : null}
      </div>
    );
  }),
);

TextArea.displayName = 'TextArea';
