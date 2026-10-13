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
  /** Controls padding, radius, and typography; autoResize also uses the matching TextField height. */
  size?: TextAreaSize;
  /**
   * `default` is the standard bordered box (rounded on all four corners). `inline` has no visible
   * border or background at rest - a background and bottom accent line reveal on hover, focus, or
   * invalid, and its bottom corners stay square. For a field inside a row, such as Key Value Pair.
   * The same axis as Text Field's, Field's, and Figma's `context`.
   */
  context?: TextAreaContext;
  /** @deprecated Use `context`: `subtle` and `inline` map to `context="inline"`. Still accepted. */
  appearance?: TextAreaAppearance;
  /** Sets `aria-invalid` and paints the error border. */
  invalid?: boolean;
  /** Which edges the user can drag to resize. Defaults to `vertical`. */
  resize?: TextAreaResize;
  /** Grow/shrink to content, starting at the matching TextField height. Overrides rows and manual resize. Defaults to false. */
  autoResize?: boolean;
  /** Maximum visible text lines when autoResize is enabled, before vertical scrolling. Defaults to 6. */
  maxRows?: number;
  /** A trailing icon or interactive control (e.g. an edit pencil IconButton). */
  iconAfter?: React.ReactNode;
  className?: string;
}
