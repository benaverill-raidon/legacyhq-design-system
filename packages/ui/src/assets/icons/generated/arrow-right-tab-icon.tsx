import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowRightTabIcon = React.memo(function ArrowRightTabIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.06 4.94L10.4467 7.33333H1V8.66667H10.4467L8.05333 11.06L9 12L13 8L9 4L8.06 4.94ZM13.6667 4V12H15V4H13.6667Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowRightTabIcon.displayName = 'ArrowRightTabIcon';
