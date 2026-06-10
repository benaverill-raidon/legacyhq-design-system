import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const FilterIcon = React.memo(function FilterIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.66667 12H9.33333V10.6667H6.66667V12ZM2 4V5.33333H14V4H2ZM4 8.66667H12V7.33333H4V8.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

FilterIcon.displayName = 'FilterIcon';
