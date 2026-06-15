import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LayoutTwoColumnsSidebarRightIcon = React.memo(function LayoutTwoColumnsSidebarRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6667 3.33301C13.403 3.33301 14 3.92996 14 4.66634V11.333C14 12.0694 13.403 12.6663 12.6667 12.6663H3.33333C2.59695 12.6663 2 12.0694 2 11.333V4.66634C2 3.92996 2.59695 3.33301 3.33333 3.33301H12.6667ZM10.4467 11.333H12.6667V4.66634H10.4467V11.333ZM3.33333 11.333H9.10667V4.66634H3.33333V11.333Z" fill="currentColor"/>
    </IconBase>
  );
});

LayoutTwoColumnsSidebarRightIcon.displayName = 'LayoutTwoColumnsSidebarRightIcon';
