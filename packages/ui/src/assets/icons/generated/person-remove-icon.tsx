import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PersonRemoveIcon = React.memo(function PersonRemoveIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9 5.33317C9 3.85984 7.80667 2.6665 6.33333 2.6665C4.86 2.6665 3.66667 3.85984 3.66667 5.33317C3.66667 6.8065 4.86 7.99984 6.33333 7.99984C7.80667 7.99984 9 6.8065 9 5.33317ZM7.66667 5.33317C7.66667 6.0665 7.06667 6.6665 6.33333 6.6665C5.6 6.6665 5 6.0665 5 5.33317C5 4.59984 5.6 3.99984 6.33333 3.99984C7.06667 3.99984 7.66667 4.59984 7.66667 5.33317Z" fill="currentColor"/>
<path d="M1 11.9998V13.3332H11.6667V11.9998C11.6667 10.2265 8.11333 9.33317 6.33333 9.33317C4.55333 9.33317 1 10.2265 1 11.9998ZM2.33333 11.9998C2.46667 11.5265 4.53333 10.6665 6.33333 10.6665C8.12667 10.6665 10.18 11.5198 10.3333 11.9998H2.33333Z" fill="currentColor"/>
<path d="M15 6.6665H11V7.99984H15V6.6665Z" fill="currentColor"/>
    </IconBase>
  );
});

PersonRemoveIcon.displayName = 'PersonRemoveIcon';
