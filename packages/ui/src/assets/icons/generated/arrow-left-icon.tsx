import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowLeftIcon = React.memo(function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M5.99998 12.6666L6.93998 11.7266L3.88665 8.66659H14.6666V7.33325H3.88665L6.94665 4.27325L5.99998 3.33325L1.33331 7.99992L5.99998 12.6666Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowLeftIcon.displayName = 'ArrowLeftIcon';
