import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TreasuryDirectIcon = React.memo(function TreasuryDirectIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13 2.3335L12 1.3335L11 2.3335L10 1.3335L9 2.3335L8 1.3335L7 2.3335L6 1.3335L5 2.3335L4 1.3335V10.6668H2V12.6668C2 13.7735 2.89333 14.6668 4 14.6668H12C13.1067 14.6668 14 13.7735 14 12.6668V1.3335L13 2.3335ZM10 13.3335H4C3.63333 13.3335 3.33333 13.0335 3.33333 12.6668V12.0002H10V13.3335ZM12.6667 12.6668C12.6667 13.0335 12.3667 13.3335 12 13.3335C11.6333 13.3335 11.3333 13.0335 11.3333 12.6668V10.6668H5.33333V3.3335H12.6667V12.6668Z" fill="currentColor"/>
<path d="M10 4.66683H6V6.00016H10V4.66683Z" fill="currentColor"/>
<path d="M12 4.66683H10.6667V6.00016H12V4.66683Z" fill="currentColor"/>
<path d="M10 6.66683H6V8.00016H10V6.66683Z" fill="currentColor"/>
<path d="M12 6.66683H10.6667V8.00016H12V6.66683Z" fill="currentColor"/>
    </IconBase>
  );
});

TreasuryDirectIcon.displayName = 'TreasuryDirectIcon';
