import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const SortAscendingIcon = React.memo(function SortAscendingIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2 4.67122L6 4.67122V6.00456L2 6.00456L2 4.67122ZM2 12.6712L2 11.3379L14 11.3379V12.6712L2 12.6712ZM2 8.00456L9.3346 8.00456L9.3346 9.33789L2 9.33789L2 8.00456Z" fill="currentColor"/>
<path d="M13.0244 5.99577L15.0244 5.99577L12.3577 3.3291L9.69108 5.99577H11.6911V9.33171H13.0244L13.0244 5.99577Z" fill="currentColor"/>
    </IconBase>
  );
});

SortAscendingIcon.displayName = 'SortAscendingIcon';
