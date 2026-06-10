import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CaretUpIcon = React.memo(function CaretUpIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.66669 9.66683L8.00002 6.3335L11.3334 9.66683H4.66669Z" fill="currentColor"/>
    </IconBase>
  );
});

CaretUpIcon.displayName = 'CaretUpIcon';
