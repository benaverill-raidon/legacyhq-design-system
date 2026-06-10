import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CaretDownIcon = React.memo(function CaretDownIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.66669 6.3335L8.00002 9.66683L11.3334 6.3335H4.66669Z" fill="currentColor"/>
    </IconBase>
  );
});

CaretDownIcon.displayName = 'CaretDownIcon';
