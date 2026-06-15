import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ChevronDoubleLeftIcon = React.memo(function ChevronDoubleLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11.7266 12L12.6666 11.06L9.61331 8L12.6666 4.94L11.7266 4L7.72665 8L11.7266 12Z" fill="currentColor"/>
<path d="M7.33331 12L8.27331 11.06L5.21998 8L8.27331 4.94L7.33331 4L3.33331 8L7.33331 12Z" fill="currentColor"/>
    </IconBase>
  );
});

ChevronDoubleLeftIcon.displayName = 'ChevronDoubleLeftIcon';
