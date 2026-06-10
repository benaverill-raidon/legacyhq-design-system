import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LayoutTwoColumnsSidebarLeftIcon = React.memo(function LayoutTwoColumnsSidebarLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M3.33333 3.33447C2.59695 3.33447 2 3.93143 2 4.66781V11.3345C2 12.0709 2.59695 12.6678 3.33333 12.6678H12.6667C13.403 12.6678 14 12.0709 14 11.3345V4.66781C14 3.93143 13.403 3.33447 12.6667 3.33447H3.33333ZM5.55333 11.3345H3.33333V4.66781H5.55333V11.3345ZM12.6667 11.3345H6.89333V4.66781H12.6667V11.3345Z" fill="currentColor"/>
    </IconBase>
  );
});

LayoutTwoColumnsSidebarLeftIcon.displayName = 'LayoutTwoColumnsSidebarLeftIcon';
