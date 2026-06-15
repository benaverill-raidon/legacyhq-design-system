import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const WillIcon = React.memo(function WillIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M10.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V5.33333L10.6667 2ZM12.6667 12.6667H3.33333V3.33333H10V6H12.6667V12.6667ZM4.66667 11.3333H11.3333V10H4.66667V11.3333ZM8 4.66667H4.66667V6H8V4.66667ZM4.66667 8.66667H11.3333V7.33333H4.66667V8.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

WillIcon.displayName = 'WillIcon';
