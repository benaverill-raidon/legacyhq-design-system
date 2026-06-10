import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const IntegrityManagementIcon = React.memo(function IntegrityManagementIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M13.3334 2H2.66671C1.93337 2 1.33337 2.6 1.33337 3.33333V12.6667C1.33337 13.4 1.93337 14 2.66671 14H13.3334C14.0667 14 14.6667 13.4 14.6667 12.6667V3.33333C14.6667 2.6 14.0667 2 13.3334 2ZM13.3334 12.6667H2.66671V3.33333H13.3334V12.6667Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M12.94 6.94667L11.9934 6L9.88004 8.11333L8.94004 7.16667L8.00004 8.10667L9.88004 10L12.94 6.94667Z" fill="currentColor"/>
<path d="M6.66671 4.66667H3.33337V6H6.66671V4.66667Z" fill="currentColor"/>
<path d="M6.66671 7.33333H3.33337V8.66667H6.66671V7.33333Z" fill="currentColor"/>
<path d="M6.66671 10H3.33337V11.3333H6.66671V10Z" fill="currentColor"/>
    </IconBase>
  );
});

IntegrityManagementIcon.displayName = 'IntegrityManagementIcon';
