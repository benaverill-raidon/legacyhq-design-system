import type * as React from 'react';

export type ToggleIconButtonTone = 'default' | 'subtle';

export type ToggleIconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ToggleIconButtonShape = 'square' | 'round';

export interface ToggleIconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  /** The square's side and its corner radius, on the same control heights as Icon Button. */
  size?: ToggleIconButtonSize;
  /**
   * The visual style, not a meaning: `default` has a border, `subtle` has none in any state. Both
   * share the same selected fill.
   */
  tone?: ToggleIconButtonTone;
  /** `square` follows the size's corner radius; `round` is a full circle at every size. */
  shape?: ToggleIconButtonShape;
  /**
   * Whether the option is on. Sets `aria-pressed` and the selected look. Controlled: the button never
   * changes it itself, so flip it in `onClick`.
   */
  isSelected?: boolean;
  /**
   * Sets the native `disabled` attribute: the button leaves the tab order and ignores clicks. It
   * overrides the selected look; `aria-pressed` stays.
   */
  isDisabled?: boolean;
  /** The icon. It's hidden from assistive technology, so name the button with `aria-label`. */
  children: React.ReactNode;
  /**
   * The accessible name. Name the option, and keep it the same whether the button is selected or
   * not. Required unless you use `aria-labelledby`.
   */
  'aria-label'?: string;
  /** The id of visible text that names the button, in place of `aria-label`. */
  'aria-labelledby'?: string;
  /** The native button type. Defaults to `button`, so it submits a form only when it's `submit`. */
  type?: 'button' | 'submit' | 'reset';
  /** Called on activation. Toggle Icon Button doesn't change `isSelected` on its own: flip it here. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
