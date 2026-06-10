import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PriorityMajorIcon = React.memo(function PriorityMajorIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.0108 13.921L4.9508 14.861L8.0108 11.8076L11.0708 14.861L12.0108 13.921L8.0108 9.92097L4.0108 13.921Z" fill="currentColor"/>
<path d="M4.0108 9.52763L4.9508 10.4676L8.0108 7.4143L11.0708 10.4676L12.0108 9.52763L8.0108 5.52763L4.0108 9.52763Z" fill="currentColor"/>
<path d="M4 5.13867L4.94 6.07867L8 3.02534L11.06 6.07867L12 5.13867L8 1.13867L4 5.13867Z" fill="currentColor"/>
    </IconBase>
  );
});

PriorityMajorIcon.displayName = 'PriorityMajorIcon';
