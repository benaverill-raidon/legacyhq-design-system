import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ChevronLeftIcon = React.memo(function ChevronLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M10.47 4.94L9.53003 4L5.53003 8L9.53003 12L10.47 11.06L7.4167 8L10.47 4.94Z" fill="currentColor"/>
    </IconBase>
  );
});

ChevronLeftIcon.displayName = 'ChevronLeftIcon';
