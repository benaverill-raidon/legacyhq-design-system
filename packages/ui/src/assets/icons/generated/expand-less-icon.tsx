import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ExpandLessIcon = React.memo(function ExpandLessIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8 5.52979L4 9.52978L4.94 10.4698L8 7.41645L11.06 10.4698L12 9.52978L8 5.52979Z" fill="currentColor"/>
    </IconBase>
  );
});

ExpandLessIcon.displayName = 'ExpandLessIcon';
