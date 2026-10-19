import type * as React from 'react';

export type ToggleButtonTone = 'default' | 'subtle';

export type ToggleButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ToggleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Control height, padding, and corner radius. `lg` also sets the label one type size larger. */
  size?: ToggleButtonSize;
  /**
   * The visual style, not a meaning: `default` has a border, `subtle` has none in any state. Both
   * share the same selected fill.
   */
  tone?: ToggleButtonTone;
  /**
   * Whether the option is on. Sets `aria-pressed` and the selected look. Controlled: the button never
   * changes it itself, so flip it in `onClick`.
   */
  isSelected?: boolean;
  /**
   * The native attribute: the button leaves the tab order and ignores clicks. It overrides the
   * selected look; `aria-pressed` stays.
   */
  disabled?: boolean;
  /** @deprecated Use the native `disabled`, as every other control does. Still accepted. */
  isDisabled?: boolean;
  /** An icon before the label, to support it, never to replace it. */
  iconBefore?: React.ReactNode;
  /** An icon after the label. */
  iconAfter?: React.ReactNode;
  /** The visible label, and the accessible name. Keep it the same whether the button is selected or not. */
  children: React.ReactNode;
  /** The native button type. Defaults to `button`, so it submits a form only when it's `submit`. */
  type?: 'button' | 'submit' | 'reset';
  /** Called on activation. Toggle Button doesn't change `isSelected` on its own: flip it here. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
