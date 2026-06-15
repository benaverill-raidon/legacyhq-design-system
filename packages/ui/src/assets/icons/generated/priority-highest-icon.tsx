import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PriorityHighestIcon = React.memo(function PriorityHighestIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4 11.7268L4.94 12.6668L8 9.6135L11.06 12.6668L12 11.7268L8 7.72683L4 11.7268Z" fill="currentColor"/>
<path d="M4 7.3335L4.94 8.2735L8 5.22016L11.06 8.2735L12 7.3335L8 3.3335L4 7.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

PriorityHighestIcon.displayName = 'PriorityHighestIcon';
