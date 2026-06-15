import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const NodeIcon = React.memo(function NodeIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M10.6666 8.00016C10.6666 9.47572 9.47554 10.6668 7.99998 10.6668C6.52442 10.6668 5.33331 9.47572 5.33331 8.00016C5.33331 6.52461 6.52442 5.3335 7.99998 5.3335C9.47554 5.3335 10.6666 6.52461 10.6666 8.00016Z" fill="currentColor"/>
    </IconBase>
  );
});

NodeIcon.displayName = 'NodeIcon';
