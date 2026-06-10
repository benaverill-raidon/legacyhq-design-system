import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const FigmaComponentIcon = React.memo(function FigmaComponentIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.00002 0.666504L4.79169 3.87484L8.00002 7.08317L11.2084 3.87484L8.00002 0.666504Z" fill="currentColor"/>
<path d="M8.00002 8.9165L4.79169 12.1248L8.00002 15.3332L11.2084 12.1248L8.00002 8.9165Z" fill="currentColor"/>
<path d="M0.666687 7.99984L3.87502 4.7915L7.08335 7.99984L3.87502 11.2082L0.666687 7.99984Z" fill="currentColor"/>
<path d="M12.125 4.7915L8.91669 7.99984L12.125 11.2082L15.3334 7.99984L12.125 4.7915Z" fill="currentColor"/>
    </IconBase>
  );
});

FigmaComponentIcon.displayName = 'FigmaComponentIcon';
