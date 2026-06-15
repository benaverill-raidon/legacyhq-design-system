import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ChevronRightIcon = React.memo(function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.47003 4L5.53003 4.94L8.58336 8L5.53003 11.06L6.47003 12L10.47 8L6.47003 4Z" fill="currentColor"/>
    </IconBase>
  );
});

ChevronRightIcon.displayName = 'ChevronRightIcon';
