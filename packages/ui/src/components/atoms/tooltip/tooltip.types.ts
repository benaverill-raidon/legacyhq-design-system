import type * as React from 'react';

/**
 * Anything else set on Tooltip is passed to its child, the trigger: `aria-*` and `data-*`
 * attributes, `role`, `style` (merged), and event handlers (run after the child's own). This is
 * what lets a component that wires its trigger by cloning it, such as Popup or Dropdown Menu, wrap a
 * Tooltip and still reach the real trigger.
 */
export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'content' | 'children' | 'className'> {
  /** The tooltip text. Empty, `null`, or `undefined` content renders the child alone, with no tooltip behavior. */
  content: React.ReactNode;
  /** The trigger: one element that can take focus and pointer events, such as an Icon Button. */
  children: React.ReactElement;
  /** Truncates the text to one line with an ellipsis when `true` (the default); wraps it when `false`. */
  truncate?: boolean;
  /** Turns the tooltip off without unmounting the child. Not the trigger's disabled state. */
  disabled?: boolean;
  /** Milliseconds between hover or focus and showing the tooltip. Defaults to 300. */
  delay?: number;
  /** Added to the tooltip bubble's classes, not the trigger's. */
  className?: string;
  /** Forwarded to the child and merged with the child's own ref, so a wrapper can reach the trigger. */
  ref?: React.Ref<HTMLElement>;
}
