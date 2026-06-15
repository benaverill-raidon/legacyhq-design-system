import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CloseIcon = React.memo(function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6666 4.2735L11.7266 3.3335L7.99998 7.06016L4.27331 3.3335L3.33331 4.2735L7.05998 8.00016L3.33331 11.7268L4.27331 12.6668L7.99998 8.94016L11.7266 12.6668L12.6666 11.7268L8.93998 8.00016L12.6666 4.2735Z" fill="currentColor"/>
    </IconBase>
  );
});

CloseIcon.displayName = 'CloseIcon';
