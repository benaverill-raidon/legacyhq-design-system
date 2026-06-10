import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const GrowDiagonalIcon = React.memo(function GrowDiagonalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M14 7.33333V2H8.66667L10.86 4.19333L4.19333 10.86L2 8.66667V14H7.33333L5.14 11.8067L11.8067 5.14L14 7.33333Z" fill="currentColor"/>
    </IconBase>
  );
});

GrowDiagonalIcon.displayName = 'GrowDiagonalIcon';
