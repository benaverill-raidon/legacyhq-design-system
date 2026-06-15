import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const OutlineIcon = React.memo(function OutlineIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M3.33333 5.99984L3.33333 4.6665L12.6667 4.6665L12.6667 5.99984L3.33333 5.99984ZM2 12.6665L14 12.6665L14 11.3332L2 11.3332L2 12.6665ZM2 9.99984L14 9.99984L14 8.6665L2 8.6665L2 9.99984ZM2 7.33317L14 7.33317L14 3.33317L2 3.33317L2 7.33317Z" fill="currentColor"/>
    </IconBase>
  );
});

OutlineIcon.displayName = 'OutlineIcon';
