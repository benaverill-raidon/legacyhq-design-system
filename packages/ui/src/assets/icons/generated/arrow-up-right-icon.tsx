import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowUpRightIcon = React.memo(function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.33333 3V4.33333H10.7267L3 12.06L3.94 13L11.6667 5.27333V9.66667H13V3H6.33333Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowUpRightIcon.displayName = 'ArrowUpRightIcon';
