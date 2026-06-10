import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ArrowDownRightIcon = React.memo(function ArrowDownRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13 6.33333H11.6667V10.7267L3.94 3L3 3.94L10.7267 11.6667H6.33333V13H13V6.33333Z" fill="currentColor"/>
    </IconBase>
  );
});

ArrowDownRightIcon.displayName = 'ArrowDownRightIcon';
