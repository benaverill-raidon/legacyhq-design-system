import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const RealEstateIcon = React.memo(function RealEstateIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6666 4.66667H11.3333V6H12.6666V4.66667Z" fill="currentColor"/>
<path d="M12.6666 7.33333H11.3333V8.66667H12.6666V7.33333Z" fill="currentColor"/>
<path d="M12.6666 10H11.3333V11.3333H12.6666V10Z" fill="currentColor"/>
<path d="M0.666626 7.33333V14H4.66663V10.6667H5.99996V14H9.99996V7.33333L5.33329 4L0.666626 7.33333ZM8.66663 12.6667H7.33329V9.33333H3.33329V12.6667H1.99996V8L5.33329 5.66667L8.66663 8V12.6667Z" fill="currentColor"/>
<path d="M6.66663 2V3.31333L7.99996 4.26667V3.33333H14V12.6667H11.3333V14H15.3333V2H6.66663Z" fill="currentColor"/>
    </IconBase>
  );
});

RealEstateIcon.displayName = 'RealEstateIcon';
