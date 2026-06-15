import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowLeftTabIcon = React.memo(function ArrowLeftTabIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M7.94 4.94L5.55333 7.33333H15V8.66667H5.55333L7.94667 11.06L7 12L3 8L7 4L7.94 4.94ZM2.33333 4V12H1V4H2.33333Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowLeftTabIcon.displayName = 'ArrowLeftTabIcon';
