import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ChevronDoubleRightIcon = React.memo(function ChevronDoubleRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.27331 4L3.33331 4.94L6.38665 8L3.33331 11.06L4.27331 12L8.27331 8L4.27331 4Z" fill="currentColor"/>
<path d="M8.66665 4L7.72665 4.94L10.78 8L7.72665 11.06L8.66665 12L12.6666 8L8.66665 4Z" fill="currentColor"/>
    </IconBase>
  );
});

ChevronDoubleRightIcon.displayName = 'ChevronDoubleRightIcon';
