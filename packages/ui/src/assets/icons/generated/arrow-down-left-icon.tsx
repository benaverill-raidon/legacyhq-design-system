import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowDownLeftIcon = React.memo(function ArrowDownLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9.66667 13V11.6667H5.27333L13 3.94L12.06 3L4.33333 10.7267V6.33333H3V13H9.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowDownLeftIcon.displayName = 'ArrowDownLeftIcon';
