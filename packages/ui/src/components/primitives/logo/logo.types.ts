export type LogoType = 'mark' | 'wordmark' | 'full';
export type LogoSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface LogoProps {
  /** Which lockup: `mark`, the symbol; `wordmark`, the name; or `full`, both together. */
  type?: LogoType;
  /** The height: 16, 24, 32, 40, or 48px from `xxs` to `lg`. The width follows the artwork's proportions. */
  size?: LogoSize;
  /** The accessible name, unless `ariaLabel` is set, and the browser tooltip on hover. */
  title?: string;
  /** The accessible name, used over `title`. Without either, the name is "LegacyHQ". */
  ariaLabel?: string;
  /** Hides the logo from assistive technology, for when the text beside it already says LegacyHQ. Off by default, unlike Icon. */
  decorative?: boolean;
  /** Added to the root's classes. */
  className?: string;
}
