import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowDownRightAngleIcon = React.memo(function ArrowDownRightAngleIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13 9.66659L9 13.6666L8.05333 12.7199L10.4467 10.3333H3V2.33325H4.33333V8.99992H10.4467L8.05333 6.61325L9 5.66659L13 9.66659Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowDownRightAngleIcon.displayName = 'ArrowDownRightAngleIcon';
