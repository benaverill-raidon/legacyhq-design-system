import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const SendIcon = React.memo(function SendIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2.34 4.02L7.34667 6.16667L2.33333 5.5L2.34 4.02ZM7.34 9.83333L2.33333 11.98V10.5L7.34 9.83333ZM1.00667 2L1 6.66667L11 8L1 9.33333L1.00667 14L15 8L1.00667 2Z" fill="currentColor"/>
    </IconBase>
  );
});

SendIcon.displayName = 'SendIcon';
