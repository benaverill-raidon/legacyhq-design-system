import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LogInIcon = React.memo(function LogInIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M7.33331 4.66667L6.39998 5.6L8.13331 7.33333H1.33331V8.66667H8.13331L6.39998 10.4L7.33331 11.3333L10.6666 8L7.33331 4.66667ZM13.3333 12.6667H7.99998V14H13.3333C14.0666 14 14.6666 13.4 14.6666 12.6667V3.33333C14.6666 2.6 14.0666 2 13.3333 2H7.99998V3.33333H13.3333V12.6667Z" fill="currentColor"/>
    </IconBase>
  );
});

LogInIcon.displayName = 'LogInIcon';
