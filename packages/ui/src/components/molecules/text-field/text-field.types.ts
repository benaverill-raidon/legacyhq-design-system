import type * as React from 'react';

export type TextFieldSize = 'sm' | 'md' | 'lg';
/** `inline` is chromeless until hovered or focused, for a field inside a row (Figma's context=inline). */
export type TextFieldContext = 'default' | 'inline';
/** @deprecated Use `TextFieldContext`: `subtle` and `inline` are both `inline`. */
export type TextFieldAppearance = 'default' | 'subtle' | 'inline';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextFieldSize;
  /** `default` (bordered) or `inline` (chromeless until hovered or focused). Defaults to `default`. */
  context?: TextFieldContext;
  /** @deprecated Use `context`: `subtle` and `inline` map to `context="inline"`. Still accepted. */
  appearance?: TextFieldAppearance;
  invalid?: boolean;
  /** Icon or short text only (e.g. a currency prefix). Always decorative/non-interactive. */
  iconBefore?: React.ReactNode;
  /**
   * Interactive content rendered inside the frame, between `iconBefore` and the input, sharing the
   * input's row. Unlike `iconBefore` (a fixed, decorative, aria-hidden slot) this is not
   * aria-hidden and may hold real controls - it exists so a token/multi-select field (e.g. Select)
   * can render removable chips ahead of the input without a second bordered frame. It shrinks and
   * clips rather than pushing the input out of view, keeping the field single-line.
   */
  leadingContent?: React.ReactNode;
  /** An icon, or an interactive control such as an IconButton (clear action) or Button. */
  iconAfter?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}
