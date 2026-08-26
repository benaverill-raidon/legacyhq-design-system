import type { ButtonProps } from '../../atoms/button';
import type { MenuSection } from '../../organisms/menu';

export type SplitButtonAppearance = 'default' | 'primary';

export interface SplitButtonProps extends Omit<ButtonProps, 'appearance' | 'isFullWidth'> {
  /** Visual weight, matching the two verified Figma variants exactly - not Button's full appearance range (no 'subtle' split-button exists in Figma). */
  appearance?: SplitButtonAppearance;
  /** The small group of related actions shown in the dropdown panel when the secondary segment is activated. */
  sections: MenuSection[];
  /**
   * Accessible name for the secondary (caret-only) segment and its dropdown panel - required,
   * since there is no visible text to derive it from. Also becomes that segment's tooltip
   * (IconButton's own existing behavior: an explicit `aria-label` with no `tooltip` override is
   * shown as a tooltip automatically).
   */
  secondaryActionLabel: string;
}
