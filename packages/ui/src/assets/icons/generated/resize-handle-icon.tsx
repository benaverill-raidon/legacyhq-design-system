import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ResizeHandleIcon = React.memo(function ResizeHandleIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <g clipPath="url(#clip0_1499_1823)">
<path d="M0.00299072 15.0546L15.0547 0.00292969L15.9975 0.945739L0.9458 15.9974L0.00299072 15.0546Z" fill="currentColor"/>
<path d="M7.99544 15.0615L15.0543 8.00266L15.9971 8.94547L8.93825 16.0043L7.99544 15.0615Z" fill="currentColor"/>
</g>
    </IconBase>
  );
});

ResizeHandleIcon.displayName = 'ResizeHandleIcon';
