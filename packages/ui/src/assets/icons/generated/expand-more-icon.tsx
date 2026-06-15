import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ExpandMoreIcon = React.memo(function ExpandMoreIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11.06 5.52979L8 8.58312L4.94 5.52979L4 6.46978L8 10.4698L12 6.46978L11.06 5.52979Z" fill="currentColor"/>
    </IconBase>
  );
});

ExpandMoreIcon.displayName = 'ExpandMoreIcon';
