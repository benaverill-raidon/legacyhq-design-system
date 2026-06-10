import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const SidebarCollapseIcon = React.memo(function SidebarCollapseIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M3.33333 3.33398C2.59695 3.33398 2 3.93094 2 4.66732V11.334C2 12.0704 2.59695 12.6673 3.33333 12.6673H12.6667C13.403 12.6673 14 12.0704 14 11.334V4.66732C14 3.93094 13.403 3.33398 12.6667 3.33398H3.33333ZM5.55333 11.334H3.33333V4.66732H5.55333V11.334ZM12.6667 11.334H6.89333V4.66732H12.6667V11.334Z" fill="currentColor"/>
<path d="M9.41421 8.00059L10.5927 6.82207L9.88562 6.11497L8 8.00059L9.88562 9.8862L10.5927 9.1791L9.41421 8.00059Z" fill="currentColor"/>
    </IconBase>
  );
});

SidebarCollapseIcon.displayName = 'SidebarCollapseIcon';
