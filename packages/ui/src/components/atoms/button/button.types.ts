import type * as React from 'react';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProminence = 'primary' | 'secondary' | 'tertiary';

export type ButtonTone = 'default' | 'brand' | 'warning' | 'error';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Control height, padding, and corner radius. `lg` also sets the label one type size larger. */
  size?: ButtonSize;
  /** How much attention the button draws, separate from what it means (`tone`). */
  prominence?: ButtonProminence;
  /**
   * What the action means. `brand` works at every prominence, `error` at primary and secondary, and
   * `warning` at primary only; any other pairing renders the prominence's default look.
   */
  tone?: ButtonTone;
  /**
   * The on-dark treatment, for a dark or bold surface such as Banner: no fill, inverse text, and light
   * hover and press overlays. `disabled` overrides it.
   */
  isInverse?: boolean;
  /**
   * Shows a Spinner over the content without changing the button's size, sets `aria-busy`, and ignores
   * clicks. The label stays the accessible name.
   */
  isLoading?: boolean;
  /** Fills the width of the container, for a form footer or a mobile action bar. */
  isFullWidth?: boolean;
  /**
   * Whether the menu or panel this button opens is open. Sets `aria-expanded` and keeps the hover fill
   * while open. Leave it unset on a button that doesn't open anything.
   */
  isExpanded?: boolean;
  /** An icon before the label, to support it, never to replace it. */
  iconBefore?: React.ReactNode;
  /** An icon after the label, such as an arrow to continue or a caret for a menu. */
  iconAfter?: React.ReactNode;
  /** The visible label. Required: for an icon-only action, use Icon Button. */
  children: React.ReactNode;
  /** The native attribute: takes the button out of the tab order and ignores clicks. */
  disabled?: boolean;
  /** The native button type. Defaults to `button`, so a Button in a form submits only when it's `submit`. */
  type?: 'button' | 'submit' | 'reset';
  /** Not called while the button is disabled or loading. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// Kept for sibling button-type components pending their Figma revision.
export type ButtonAppearance = 'default' | 'primary' | 'subtle';
