import type * as React from 'react';
import type { ButtonProps, ButtonSize, ButtonTone } from '../../atoms/button';
import type { MenuSection } from '../../organisms/menu';

export type SplitButtonAppearance = 'default' | 'primary';

export interface SplitButtonProps extends Omit<ButtonProps, 'appearance' | 'isFullWidth'> {
  /**
   * The style of both halves: `default` is outlined (Button's `secondary` prominence beside an
   * outlined Icon Button), `primary` has the brand fill on both. There's no subtle split button.
   */
  appearance?: SplitButtonAppearance;
  /** The control height of both halves, on the same scale as Button. */
  size?: ButtonSize;
  /** The main action's visible label. It's the primary button's accessible name. */
  children: React.ReactNode;
  /** Runs the main action. Not called while the Split Button is disabled or loading. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * The related actions in the menu the caret opens, as Menu sections. Each item's `onSelect` runs
   * the action; choosing an item then closes the menu and returns focus to the caret.
   */
  sections: MenuSection[];
  /**
   * The caret's accessible name, also shown as its tooltip and used to name the menu. Required, since
   * the caret has no visible text. Name the main action, such as "More save options".
   */
  secondaryActionLabel: string;
  /** Disables both halves with the native attribute, so neither is in the tab order. */
  disabled?: boolean;
  /**
   * Shows Button's loading state on the main action, a Spinner over the label at the same size, and
   * disables the caret until it's done.
   */
  isLoading?: boolean;
  /** An icon before the main action's label. */
  iconBefore?: React.ReactNode;
  /** An icon after the main action's label. The caret is separate, so don't add another. */
  iconAfter?: React.ReactNode;
  /**
   * @deprecated It reaches only the main action until Icon Button has a tone, so the caret doesn't
   * match it. It still works as before. Leave it unset, and use a Button with a tone for a
   * destructive action.
   */
  tone?: ButtonTone;
  /** Set on the wrapping `div`, not on either button. */
  id?: string;
}
