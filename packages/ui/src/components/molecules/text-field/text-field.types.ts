import type * as React from 'react';

export type TextFieldSize = 'sm' | 'md' | 'lg';
/** `inline` is chromeless until hovered or focused, for a field inside a row (Figma's context=inline). */
export type TextFieldContext = 'default' | 'inline';
/** @deprecated Use `TextFieldContext`: `subtle` and `inline` are both `inline`. */
export type TextFieldAppearance = 'default' | 'subtle' | 'inline';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** The field's height: `sm` 32px, `md` 40px, `lg` 48px, with padding and corners to match. `lg` also uses the larger body text. */
  size?: TextFieldSize;
  /**
   * Where the field sits. `default` is the bordered field; `inline` has no border or background until
   * hovered or focused, for a field inside a row. Defaults to `default`.
   */
  context?: TextFieldContext;
  /** @deprecated Use `context`: `subtle` and `inline` map to `context="inline"`. Still accepted. */
  appearance?: TextFieldAppearance;
  /** Shows the error border, whether or not the field has focus, and sets `aria-invalid` on the input. */
  invalid?: boolean;
  /** The native attribute: greys the field, takes the input out of the tab order, and stops editing. */
  disabled?: boolean;
  /** An icon or a short text prefix, such as `$`. Always decorative: it's hidden from assistive technology. */
  iconBefore?: React.ReactNode;
  /**
   * Content between `iconBefore` and the input that, unlike `iconBefore`, can hold controls. Select
   * uses it for its multi-select chips. It shrinks and clips so the field stays on one line.
   */
  leadingContent?: React.ReactNode;
  /** An icon, a Label, or a control such as an Icon Button that clears the field. Not hidden from assistive technology. */
  iconAfter?: React.ReactNode;
  /** Added to the frame's classes. Other attributes go to the input. */
  className?: string;
  /** Added to the native input's classes. */
  inputClassName?: string;
}
