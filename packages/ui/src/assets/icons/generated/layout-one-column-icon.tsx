import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LayoutOneColumnIcon = React.memo(function LayoutOneColumnIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6667 2.6665H3.33333C2.6 2.6665 2 3.2665 2 3.99984V11.9998C2 12.7332 2.6 13.3332 3.33333 13.3332H12.6667C13.4 13.3332 14 12.7332 14 11.9998V3.99984C14 3.2665 13.4 2.6665 12.6667 2.6665ZM12.6667 11.9998H3.33333V3.99984H12.6667V11.9998Z" fill="currentColor"/>
    </IconBase>
  );
});

LayoutOneColumnIcon.displayName = 'LayoutOneColumnIcon';
