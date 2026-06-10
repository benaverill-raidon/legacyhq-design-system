import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CaretRightIcon = React.memo(function CaretRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.33331 11.3332L9.66665 7.99984L6.33331 4.6665V11.3332Z" fill="currentColor"/>
    </IconBase>
  );
});

CaretRightIcon.displayName = 'CaretRightIcon';
