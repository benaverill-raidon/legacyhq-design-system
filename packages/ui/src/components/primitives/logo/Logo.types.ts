export type LogoType = 'mark' | 'wordmark' | 'full';
export type LogoSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface LogoProps {
  type?: LogoType;
  size?: LogoSize;
  title?: string;
  ariaLabel?: string;
  decorative?: boolean;
  className?: string;
}
