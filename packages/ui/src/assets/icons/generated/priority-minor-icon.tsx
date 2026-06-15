import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PriorityMinorIcon = React.memo(function PriorityMinorIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12 2.07867L11.06 1.13867L8 4.19201L4.94 1.13867L4 2.07867L8 6.07867L12 2.07867Z" fill="currentColor"/>
<path d="M12 6.47201L11.06 5.53201L8 8.58534L4.94 5.53201L4 6.47201L8 10.472L12 6.47201Z" fill="currentColor"/>
<path d="M12.0108 10.861L11.0708 9.92097L8.0108 12.9743L4.9508 9.92097L4.0108 10.861L8.0108 14.861L12.0108 10.861Z" fill="currentColor"/>
    </IconBase>
  );
});

PriorityMinorIcon.displayName = 'PriorityMinorIcon';
