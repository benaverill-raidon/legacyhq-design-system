import type * as React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The spinner's box: 12, 16, 24, or 48px for `sm`, `md`, `lg`, and `xl`. At `xl` the arc is drawn
   * at 32px inside the 48px box. The stroke gets thicker with size.
   */
  size?: SpinnerSize;
  /**
   * Text announced to assistive technology, rendered visually hidden. Setting it gives the spinner
   * `role="status"` and `aria-live="polite"`. Leave it unset when visible text already says what's
   * loading: the spinner is then hidden from assistive technology.
   */
  label?: string;
}
