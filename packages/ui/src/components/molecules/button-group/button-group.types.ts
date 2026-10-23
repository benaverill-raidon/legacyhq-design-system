import type * as React from 'react';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export type ButtonGroupSpacing = 'default' | 'compact';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The buttons to lay out, in order: usually Buttons, Icon Buttons, or Toggle Buttons. Each keeps
   * its own size, look, and keyboard behavior; set those on the buttons.
   */
  children: React.ReactNode;
  /** `horizontal` lays the buttons out in a row; `vertical` stacks them in a column. Neither wraps. */
  orientation?: ButtonGroupOrientation;
  /**
   * The gap between the buttons, in either orientation. `default` is 8px; `compact` is 4px, for a
   * tight row such as a set of Icon Buttons in a dense toolbar.
   */
  spacing?: ButtonGroupSpacing;
  /**
   * Names the set of actions. With a name, the group gets `role="group"`; without one, it has no
   * role. Leave it off when a heading or a dialog title already says what the buttons are for.
   */
  'aria-label'?: string;
  /** The id of visible text that names the set of actions. Like `aria-label`, it adds `role="group"`. */
  'aria-labelledby'?: string;
  /**
   * Replaces the role Button Group sets, such as `toolbar` for a set of controls that should be one
   * tab stop (you then add its arrow-key handling). Without it, a named group is `group`.
   */
  role?: React.AriaRole;
}
