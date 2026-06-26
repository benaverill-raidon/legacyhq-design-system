import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CheckboxIndeterminateIcon = React.memo(function CheckboxIndeterminateIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.6667 2C13.4 2 14 2.6 14 3.33333V12.6667C14 13.4 13.4 14 12.6667 14H3.33333C2.6 14 2 13.4 2 12.6667V3.33333C2 2.6 2.6 2 3.33333 2H12.6667ZM4.66667 8.66667H11.3333V7.33333H4.66667V8.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

CheckboxIndeterminateIcon.displayName = 'CheckboxIndeterminateIcon';
