import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TextIcon = React.memo(function TextIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M1.66669 3V5H5.00002V13H7.00002V5H10.3334V3H1.66669ZM14.3334 6.33333H8.33335V8.33333H10.3334V13H12.3334V8.33333H14.3334V6.33333Z" fill="currentColor"/>
    </IconBase>
  );
});

TextIcon.displayName = 'TextIcon';
