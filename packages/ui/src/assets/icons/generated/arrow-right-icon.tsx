import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowRightIcon = React.memo(function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9.99998 3.33325L9.05998 4.27325L12.1133 7.33325H1.33331V8.66659H12.1133L9.05331 11.7266L9.99998 12.6666L14.6666 7.99992L9.99998 3.33325Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowRightIcon.displayName = 'ArrowRightIcon';
