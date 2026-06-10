import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ReferralNewspaperIcon = React.memo(function ReferralNewspaperIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M14.6667 2L13.5534 3.11333L12.4467 2L11.3334 3.11333L10.22 2L9.11337 3.11333L8.00004 2L6.88671 3.11333L5.78004 2L4.66671 3.11333L3.55337 2L2.44671 3.11333L1.33337 2V12.6667C1.33337 13.4 1.93337 14 2.66671 14H13.3334C14.0667 14 14.6667 13.4 14.6667 12.6667V2ZM7.33337 12.6667H2.66671V8.66667H7.33337V12.6667ZM13.3334 12.6667H8.66671V11.3333H13.3334V12.6667ZM13.3334 10H8.66671V8.66667H13.3334V10ZM13.3334 7.33333H2.66671V5.33333H13.3334V7.33333Z" fill="currentColor"/>
    </IconBase>
  );
});

ReferralNewspaperIcon.displayName = 'ReferralNewspaperIcon';
