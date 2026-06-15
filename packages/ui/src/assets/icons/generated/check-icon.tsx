import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CheckIcon = React.memo(function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M5.86332 10.5831L3.08332 7.80312L2.13666 8.74312L5.86332 12.4698L13.8633 4.46979L12.9233 3.52979L5.86332 10.5831Z" fill="currentColor"/>
    </IconBase>
  );
});

CheckIcon.displayName = 'CheckIcon';
