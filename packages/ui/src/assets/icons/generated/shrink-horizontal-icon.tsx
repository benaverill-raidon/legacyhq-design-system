import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ShrinkHorizontalIcon = React.memo(function ShrinkHorizontalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M5.00262 5V7L1.66669 7L1.66669 8.33333H5.00262V10.3333L7.66929 7.66667L5.00262 5Z" fill="currentColor"/>
<path d="M5.00262 7V5L7.66929 7.66667L5.00262 10.3333V8.33333H1.66669L1.66669 7L5.00262 7Z" fill="currentColor"/>
<path d="M10.9974 8.33333V10.3333L8.33075 7.66667L10.9974 5V7L14.3334 7V8.33333H10.9974Z" fill="currentColor"/>
    </IconBase>
  );
});

ShrinkHorizontalIcon.displayName = 'ShrinkHorizontalIcon';
