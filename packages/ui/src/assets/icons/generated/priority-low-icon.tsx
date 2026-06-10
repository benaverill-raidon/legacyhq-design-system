import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PriorityLowIcon = React.memo(function PriorityLowIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.94 5.52979L8 8.58312L11.06 5.52979L12 6.46979L8 10.4698L4 6.46979L4.94 5.52979Z" fill="currentColor"/>
    </IconBase>
  );
});

PriorityLowIcon.displayName = 'PriorityLowIcon';
