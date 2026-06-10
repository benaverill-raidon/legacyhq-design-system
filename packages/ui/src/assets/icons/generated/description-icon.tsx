import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const DescriptionIcon = React.memo(function DescriptionIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M14 7.34L2 7.33333V8.66667H14V7.34ZM2 10.6667H10V12H2V10.6667ZM14 4H2V5.34L14 5.33333V4Z" fill="currentColor"/>
    </IconBase>
  );
});

DescriptionIcon.displayName = 'DescriptionIcon';
