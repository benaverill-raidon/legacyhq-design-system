import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const DataErrorIcon = React.memo(function DataErrorIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11.3333 2.6665V3.99984H13.3333V11.9998H11.3333V13.3332H14.6666V2.6665H11.3333Z" fill="currentColor"/>
<path d="M1.33331 13.3332H4.66665V11.9998H2.66665V3.99984H4.66665V2.6665H1.33331V13.3332Z" fill="currentColor"/>
<path d="M8.66665 4.6665H7.33331V8.6665H8.66665V4.6665Z" fill="currentColor"/>
<path d="M8.66665 9.99984H7.33331V11.3332H8.66665V9.99984Z" fill="currentColor"/>
    </IconBase>
  );
});

DataErrorIcon.displayName = 'DataErrorIcon';
