import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const NonQualifiedAnnuityIcon = React.memo(function NonQualifiedAnnuityIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M10.6667 4L12.1934 5.52667L8.94004 8.78L6.27337 6.11333L1.33337 11.06L2.27337 12L6.27337 8L8.94004 10.6667L13.14 6.47333L14.6667 8V4H10.6667Z" fill="currentColor"/>
    </IconBase>
  );
});

NonQualifiedAnnuityIcon.displayName = 'NonQualifiedAnnuityIcon';
