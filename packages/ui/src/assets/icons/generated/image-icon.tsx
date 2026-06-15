import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ImageIcon = React.memo(function ImageIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6667 3.33333V12.6667H3.33333V3.33333H12.6667ZM12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2ZM9.42667 7.90667L7.42667 10.4867L6 8.76L4 11.3333H12L9.42667 7.90667Z" fill="currentColor"/>
    </IconBase>
  );
});

ImageIcon.displayName = 'ImageIcon';
