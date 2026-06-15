import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowUpLeftIcon = React.memo(function ArrowUpLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M3 9.66667H4.33333V5.27333L12.06 13L13 12.06L5.27333 4.33333H9.66667V3H3V9.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowUpLeftIcon.displayName = 'ArrowUpLeftIcon';
