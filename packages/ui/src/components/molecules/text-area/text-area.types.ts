import type * as React from 'react';

export type TextAreaSize = 'md' | 'lg';
export type TextAreaAppearance = 'default' | 'subtle';

/**
 * Which edges the user may drag to resize. Maps directly to the CSS `resize` property. Defaults to
 * `vertical` - the sensible default for a text area, letting content grow downward without letting a
 * drag break the surrounding layout horizontally.
 */
export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** md / lg - controls padding, radius, and font size, matching Figma's own size axis. (sm was
   * dropped: it read almost identically to md.) */
  size?: TextAreaSize;
  /**
   * `default` is the standard bordered box (rounded on all four corners). `subtle` has no visible
   * border or background at rest - only a bottom accent line reveals on hover, focus, or invalid,
   * and its bottom corners stay square. Mirrors Text Field's own appearance axis (Figma names this
   * axis `tone`; the code uses `appearance`, the same name its sibling Text Field uses).
   */
  appearance?: TextAreaAppearance;
  /** Sets `aria-invalid` and paints the error border. */
  invalid?: boolean;
  /** Which edges the user can drag to resize. Defaults to `vertical`. */
  resize?: TextAreaResize;
  className?: string;
}
