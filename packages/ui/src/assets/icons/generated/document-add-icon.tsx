import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const DocumentAddIcon = React.memo(function DocumentAddIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11 13.1465H2.99996V4.99984H7.66663V3.6665H2.99996C2.26663 3.6665 1.66663 4.2665 1.66663 4.99984V12.9998C1.66663 13.7332 2.26663 14.3332 2.99996 14.3332H11C11.7333 14.3332 12.3333 13.7332 12.3333 12.9998V8.33317H11V13.1465Z" fill="currentColor"/>
<path d="M12.3333 1.6665H11V3.6665H8.99996C9.00663 3.67317 8.99996 4.99984 8.99996 4.99984H11V6.99317C11.0066 6.99984 12.3333 6.99317 12.3333 6.99317V4.99984H14.3333V3.6665H12.3333V1.6665Z" fill="currentColor"/>
<path d="M9.66663 6.33317H4.33329V7.6665H9.66663V6.33317Z" fill="currentColor"/>
<path d="M4.33329 8.33317V9.6665H9.66663V8.33317H4.33329Z" fill="currentColor"/>
<path d="M6.99996 10.3332H4.33329V11.6665H6.99996V10.3332Z" fill="currentColor"/>
    </IconBase>
  );
});

DocumentAddIcon.displayName = 'DocumentAddIcon';
