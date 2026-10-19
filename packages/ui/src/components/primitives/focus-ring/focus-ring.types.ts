import * as React from 'react';

export type FocusRingBorderWidth = 'default';

export interface FocusRingProps {
  /** The one focusable element to style. FocusRing clones it to add its classes; it adds no element and doesn't make anything focusable. */
  children: React.ReactElement;
  /** The ring's thickness. `default`, 2px (`border-width-md`), is the only value, as in Figma. */
  borderWidth?: FocusRingBorderWidth;
  /** Added to the child's classes, after its own and the focus classes. */
  className?: string;
  /** Removes the ring, and the browser's own focus outline, from the child. Use it only on a control that can't take focus anyway. */
  disabled?: boolean;
}
