import type * as React from 'react';

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderSize = 'xs' | 'sm' | 'md';

export interface SliderBaseProps {
  /**
   * The visible label above the track. It names the slider; on Slider Range it names the range's
   * group and is read before each handle's own name. Without it, name the slider or range with
   * `aria-label` or `aria-labelledby`.
   */
  label?: React.ReactNode;
  /** The lowest value. Defaults to `0`, or `-100` on Slider Centered. */
  min?: number;
  /** The highest value. Defaults to `100`. */
  max?: number;
  /** How much one move changes the value, and the grid the value snaps to. Defaults to `1`. */
  step?: number;
  /**
   * `horizontal`, or `vertical`: a fixed 104px tall, with the lowest value at the bottom. Defaults
   * to `horizontal`.
   */
  orientation?: SliderOrientation;
  /**
   * The track's thickness: `xs` 16px, `sm` 24px, `md` 40px. The handle and the step dots are the
   * same at every size. Defaults to `md`.
   */
  size?: SliderSize;
  /** The native `disabled` attribute: the slider can't be moved and leaves the tab order. */
  disabled?: boolean;
  /**
   * Marks the value as failing validation: draws the track and the handle in the error colors and
   * sets `aria-invalid` on the handle (both handles on Slider Range). Pair it with a visible message,
   * such as Field's `message` with `state="error"`. An `aria-invalid` of `true`, which Field passes for
   * an error, does the same. Disabled looks win over it.
   */
  invalid?: boolean;
  /**
   * Adds a dot at each step between the dots at `min` and `max`, which always show. The dots come
   * from `steps`, or from `step` when that gives 25 values or fewer.
   */
  showSteps?: boolean;
  /**
   * Where the step dots go, as values. Shown only with `showSteps`. It places dots; `step` still
   * decides where the handle snaps.
   */
  steps?: number[];
  /**
   * Keeps the value bubble above the handle showing, and makes room for it between the label and
   * the track. Without it, the bubble shows on hover, focus, and drag, over whatever is above.
   */
  showValue?: boolean;
  /** Added to the root element's classes. */
  className?: string;
}

export interface SliderProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'min' | 'max' | 'step'
    >,
    SliderBaseProps {
  /** The value, for a controlled slider. Pair it with `onValueChange`. It's kept between `min` and `max`. */
  value?: number;
  /** The starting value, for an uncontrolled slider. Defaults to `0`. */
  defaultValue?: number;
  /** Called as the value changes, by keyboard or pointer, with the new value and the change event. */
  onValueChange?: (value: number, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export type SliderCenteredProps = SliderProps;

// SliderBaseProps is extended whole, not through Omit, so the docs' API table can read its comments.
export interface SliderRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
    SliderBaseProps {
  /**
   * The lower and upper values, for a controlled range. Pair it with `onValueChange`. They're
   * sorted and kept `minDistance` apart.
   */
  value?: [number, number];
  /** The starting lower and upper values, for an uncontrolled range. */
  defaultValue?: [number, number];
  /** The smallest gap allowed between the two values. Use `0` to let the handles meet. */
  minDistance?: number;
  /**
   * Stops a handle at the other one instead of letting it pass. Without it, a handle moved past the
   * other trades places with it.
   */
  disableSwap?: boolean;
  /**
   * The lower handle's accessible name, read after the range's name (`label`, `aria-labelledby`,
   * or `aria-label`). Defaults to `Minimum value`; pass a translation.
   */
  minLabel?: string;
  /**
   * The upper handle's accessible name, read after the range's name (`label`, `aria-labelledby`,
   * or `aria-label`). Defaults to `Maximum value`; pass a translation.
   */
  maxLabel?: string;
  /**
   * The form name. Without `minName` and `maxName`, the lower value submits under `name` and the
   * upper under `name` with `Max` added (`price` and `priceMax`).
   */
  name?: string;
  /** The form name the lower value submits under. Defaults to `name`. */
  minName?: string;
  /** The form name the upper value submits under. Defaults to `name` with `Max` added. */
  maxName?: string;
  /** Called as either value changes, with both values, sorted, and the change event. */
  onValueChange?: (value: [number, number], event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * The lower handle's id, and the start of the range's other ids (`<id>-max` for the upper handle,
   * `<id>-range` for the group). Field sets it, so clicking Field's label focuses the lower handle.
   */
  id?: string;
  /**
   * Ids of elements that describe the range, added to both handles rather than the group, so each
   * handle reads them when it gets focus. Field passes its message's id.
   */
  'aria-describedby'?: string;
  /** Marks both handles invalid, as `invalid` does. Field passes it for an error. */
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  /**
   * Sets the native `required` on both handles. A range always has a value, so the browser never
   * stops a submit for it; Field passes it with its `*`.
   */
  required?: boolean;
}
