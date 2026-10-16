import type * as React from 'react';

export type TextAreaSize = 'sm' | 'md' | 'lg';
/** `inline` is chromeless until hovered or focused, for a field inside a row (Figma's context=inline). */
export type TextAreaContext = 'default' | 'inline';
/** @deprecated Use `TextAreaContext`: `subtle` and `inline` are both `inline`. */
export type TextAreaAppearance = 'default' | 'subtle' | 'inline';

/**
 * Which edges the user may drag to resize. Maps directly to the CSS `resize` property. Defaults to
 * `vertical` - the sensible default for a text area, letting content grow downward without letting a
 * drag break the surrounding layout horizontally.
 */
export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Padding, corner radius, and text size. With `autoResize`, also the starting height: `sm` 32px, `md` 40px, `lg` 48px. */
  size?: TextAreaSize;
  /**
   * Where the field sits. `default` is the bordered field; `inline` has no border or background until
   * hovered or focused, for a field inside a row such as a Key Value Pair value. Defaults to `default`.
   */
  context?: TextAreaContext;
  /** @deprecated Use `context`: `subtle` and `inline` map to `context="inline"`. Still accepted. */
  appearance?: TextAreaAppearance;
  /** Shows the error border, whether or not the field has focus, and sets `aria-invalid` on the textarea. */
  invalid?: boolean;
  /** The native attribute: greys the field, takes it out of the tab order, and stops editing and resizing. */
  disabled?: boolean;
  /** The native attribute: the starting height, in lines. Ignored with `autoResize`. */
  rows?: number;
  /** Which way someone can drag the field to resize it. Defaults to `vertical`. */
  resize?: TextAreaResize;
  /** Grows and shrinks the field with its content, starting at the control height for its `size`. Replaces `rows` and manual resizing. */
  autoResize?: boolean;
  /** With `autoResize`, the most lines the field grows to before it scrolls. Defaults to 6. */
  maxRows?: number;
  /** An icon or a control, such as an edit Icon Button, at the end of the frame. Not hidden from assistive technology. */
  iconAfter?: React.ReactNode;
  /** Added to the frame's classes. Other attributes go to the textarea. */
  className?: string;
}
