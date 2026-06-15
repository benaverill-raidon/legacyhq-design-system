import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const IncapacitatedIcon = React.memo(function IncapacitatedIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.99996 8.66683H5.33329V6.66683H6.99996V5.00016H8.99996V6.66683H10.6666V8.66683H8.99996V10.3335H6.99996V8.66683ZM7.99996 1.3335L2.66663 3.3335V7.3935C2.66663 10.7602 4.93996 13.9002 7.99996 14.6668C11.06 13.9002 13.3333 10.7602 13.3333 7.3935V3.3335L7.99996 1.3335ZM12 7.3935C12 10.0602 10.3 12.5268 7.99996 13.2802C5.69996 12.5268 3.99996 10.0668 3.99996 7.3935V4.26016L7.99996 2.76016L12 4.26016V7.3935Z" fill="currentColor"/>
    </IconBase>
  );
});

IncapacitatedIcon.displayName = 'IncapacitatedIcon';
