import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CloselyHeldBusinessIcon = React.memo(function CloselyHeldBusinessIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.24 6.00008L12.64 8.00008H3.36L3.76 6.00008H12.24ZM13.3333 2.66675H2.66667V4.00008H13.3333V2.66675ZM13.3333 4.66675H2.66667L2 8.00008V9.33341H2.66667V13.3334H9.33333V9.33341H12V13.3334H13.3333V9.33341H14V8.00008L13.3333 4.66675ZM4 12.0001V9.33341H8V12.0001H4Z" fill="currentColor"/>
    </IconBase>
  );
});

CloselyHeldBusinessIcon.displayName = 'CloselyHeldBusinessIcon';
