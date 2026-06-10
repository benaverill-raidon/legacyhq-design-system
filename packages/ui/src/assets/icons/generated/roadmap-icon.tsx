import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const RoadmapIcon = React.memo(function RoadmapIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8 10H4V11.3333H8V10Z" fill="currentColor"/>
<path d="M12 4.66667H8V6H12V4.66667Z" fill="currentColor"/>
<path d="M10 7.33333H6V8.66667H10V7.33333Z" fill="currentColor"/>
<path d="M12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2ZM12.6667 12.6667H3.33333V3.33333H12.6667V12.6667Z" fill="currentColor"/>
    </IconBase>
  );
});

RoadmapIcon.displayName = 'RoadmapIcon';
