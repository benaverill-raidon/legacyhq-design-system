import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowUpIcon = React.memo(function ArrowUpIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M3.33331 5.99992L4.27331 6.93992L7.33331 3.88658V14.6666H8.66665V3.88658L11.7266 6.94659L12.6666 5.99992L7.99998 1.33325L3.33331 5.99992Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowUpIcon.displayName = 'ArrowUpIcon';
