import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PriorityLowestIcon = React.memo(function PriorityLowestIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12 4.2735L11.06 3.3335L8 6.38683L4.94 3.3335L4 4.2735L8 8.2735L12 4.2735Z" fill="currentColor"/>
<path d="M12 8.66683L11.06 7.72683L8 10.7802L4.94 7.72683L4 8.66683L8 12.6668L12 8.66683Z" fill="currentColor"/>
    </IconBase>
  );
});

PriorityLowestIcon.displayName = 'PriorityLowestIcon';
