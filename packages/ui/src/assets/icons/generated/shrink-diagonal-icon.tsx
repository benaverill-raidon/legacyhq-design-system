import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ShrinkDiagonalIcon = React.memo(function ShrinkDiagonalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M14.6666 2.27301L11.14 5.79967L13.3333 7.99967H7.99998V2.66634L10.1933 4.85967L13.7266 1.33301L14.6666 2.27301ZM2.27331 14.6663L5.79998 11.1397L7.99998 13.333V7.99967H2.66665L4.85998 10.193L1.33331 13.7263L2.27331 14.6663Z" fill="currentColor"/>
    </IconBase>
  );
});

ShrinkDiagonalIcon.displayName = 'ShrinkDiagonalIcon';
