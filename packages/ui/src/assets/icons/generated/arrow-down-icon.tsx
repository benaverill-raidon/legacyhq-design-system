import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowDownIcon = React.memo(function ArrowDownIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6666 9.99992L11.7266 9.05992L8.66665 12.1133V1.33325H7.33331V12.1133L4.27331 9.05325L3.33331 9.99992L7.99998 14.6666L12.6666 9.99992Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowDownIcon.displayName = 'ArrowDownIcon';
