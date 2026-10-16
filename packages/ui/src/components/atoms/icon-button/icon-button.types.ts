import type * as React from 'react';
import type { ButtonAppearance, ButtonSize } from '../button';

export type IconButtonAppearance = ButtonAppearance;
export type IconButtonSize = ButtonSize;
export type IconButtonShape = 'square' | 'round';

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * The visual style: `default` is outlined, `primary` has the brand fill, and `subtle` has no border
   * and no fill until hover. Icon Button has no `tone`.
   */
  appearance?: IconButtonAppearance;
  /** The square's side and its corner radius, on the same control heights as Button. */
  size?: IconButtonSize;
  /** `square` follows the size's corner radius; `round` is a full circle at every size. */
  shape?: IconButtonShape;
  /**
   * The on-dark treatment, for a dark or bold surface such as Banner: no fill or border, the inverse
   * icon color, and light hover and press overlays. `disabled` overrides it.
   */
  isInverse?: boolean;
  /**
   * Shows a Spinner in place of the icon, at the same size, sets `aria-busy`, and ignores clicks. The
   * button stays focusable and keeps its name.
   */
  isLoading?: boolean;
  /**
   * Whether the menu or panel this button opens is open. While `true`, sets `aria-expanded` and keeps
   * the hover fill. While `false`, it sets no `aria-expanded` of its own.
   */
  isExpanded?: boolean;
  /**
   * The tooltip shown on hover and focus. Leave it unset to show a string `aria-label`; pass
   * `false` for no tooltip.
   */
  tooltip?: React.ReactNode | false;
  /** The icon. It's hidden from assistive technology, so name the button with `aria-label`. */
  children: React.ReactNode;
  /**
   * The accessible name, and the tooltip unless `tooltip` is set. Name the action, not the icon.
   * Required unless you use `aria-labelledby`.
   */
  'aria-label'?: string;
  /**
   * The id of visible text that names the button. Icon Button can't show that text as a tooltip, so
   * also set `tooltip`, or `tooltip={false}`.
   */
  'aria-labelledby'?: string;
  /** The native attribute: takes the button out of the tab order and ignores clicks. */
  disabled?: boolean;
  /** The native button type. Defaults to `button`, so it submits a form only when it's `submit`. */
  type?: 'button' | 'submit' | 'reset';
  /** Not called while the button is disabled or loading. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
