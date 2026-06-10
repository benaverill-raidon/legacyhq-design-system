import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const GrowHorizontalIcon = React.memo(function GrowHorizontalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11.34 8.66683L11.34 10.6668L14 8.00016L11.34 5.3335L11.34 7.3335L4.66 7.3335L4.66 5.3335L2 8.00016L4.66 10.6668L4.66 8.66683L11.34 8.66683Z" fill="currentColor"/>
    </IconBase>
  );
});

GrowHorizontalIcon.displayName = 'GrowHorizontalIcon';
