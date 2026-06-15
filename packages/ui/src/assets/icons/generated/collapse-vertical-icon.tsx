import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CollapseVerticalIcon = React.memo(function CollapseVerticalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M5.33335 12.6665H7.33335V15.3332H8.66669V12.6665H10.6667L8.00002 9.99984L5.33335 12.6665ZM10.6667 3.33317H8.66669V0.666504H7.33335V3.33317H5.33335L8.00002 5.99984L10.6667 3.33317ZM2.66669 7.33317V8.6665H13.3334V7.33317H2.66669Z" fill="currentColor"/>
    </IconBase>
  );
});

CollapseVerticalIcon.displayName = 'CollapseVerticalIcon';
