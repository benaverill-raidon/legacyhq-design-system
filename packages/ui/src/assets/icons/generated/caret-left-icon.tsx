import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CaretLeftIcon = React.memo(function CaretLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9.66665 4.6665L6.33331 7.99984L9.66665 11.3332V4.6665Z" fill="currentColor"/>
    </IconBase>
  );
});

CaretLeftIcon.displayName = 'CaretLeftIcon';
