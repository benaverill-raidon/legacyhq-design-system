import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LocationIcon = React.memo(function LocationIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M7.99998 1.3335C5.41998 1.3335 3.33331 3.42016 3.33331 6.00016C3.33331 9.50016 7.99998 14.6668 7.99998 14.6668C7.99998 14.6668 12.6666 9.50016 12.6666 6.00016C12.6666 3.42016 10.58 1.3335 7.99998 1.3335ZM4.66665 6.00016C4.66665 4.16016 6.15998 2.66683 7.99998 2.66683C9.83998 2.66683 11.3333 4.16016 11.3333 6.00016C11.3333 7.92016 9.41331 10.7935 7.99998 12.5868C6.61331 10.8068 4.66665 7.90016 4.66665 6.00016Z" fill="currentColor"/>
<path d="M7.99998 7.66683C8.92045 7.66683 9.66665 6.92064 9.66665 6.00016C9.66665 5.07969 8.92045 4.3335 7.99998 4.3335C7.07951 4.3335 6.33331 5.07969 6.33331 6.00016C6.33331 6.92064 7.07951 7.66683 7.99998 7.66683Z" fill="currentColor"/>
    </IconBase>
  );
});

LocationIcon.displayName = 'LocationIcon';
