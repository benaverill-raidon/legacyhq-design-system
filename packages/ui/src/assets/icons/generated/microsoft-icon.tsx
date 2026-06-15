import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const MicrosoftIcon = React.memo(function MicrosoftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.5 8.5H13.5V13.5H8.5V8.5Z" fill="currentColor"/>
<path d="M2.5 8.5H7.5V13.5H2.5V8.5Z" fill="currentColor"/>
<path d="M8.5 2.5H13.5V7.5H8.5V2.5Z" fill="currentColor"/>
<path d="M2.5 2.5H7.5V7.5H2.5V2.5Z" fill="currentColor"/>
    </IconBase>
  );
});

MicrosoftIcon.displayName = 'MicrosoftIcon';
