import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CheckboxFillIcon = React.memo(function CheckboxFillIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.6667 2C13.4 2 14 2.6 14 3.33333V12.6667C14 13.4 13.4 14 12.6667 14H3.33333C2.6 14 2 13.4 2 12.6667V3.33333C2 2.6 2.6 2 3.33333 2H12.6667ZM6.66016 9.44661L4.9401 7.73307L3.99349 8.67318L6.66016 11.3333L11.9935 6L11.0534 5.05339L6.66016 9.44661Z" fill="currentColor"/>
    </IconBase>
  );
});

CheckboxFillIcon.displayName = 'CheckboxFillIcon';
