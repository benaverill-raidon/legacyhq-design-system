import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ImageAddIcon = React.memo(function ImageAddIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11.6667 13.6667H2.33333V4.33333H8.33333V3H2.33333C1.6 3 1 3.6 1 4.33333V13.6667C1 14.4 1.6 15 2.33333 15H11.6667C12.4 15 13 14.4 13 13.6667V7.66667H11.6667V13.6667ZM6.47333 11.5533L5.16667 9.98L3.33333 12.3333H10.6667L8.30667 9.19333L6.47333 11.5533ZM13 3V1H11.6667V3H9.66667C9.67333 3.00667 9.66667 4.33333 9.66667 4.33333H11.6667V6.32667C11.6733 6.33333 13 6.32667 13 6.32667V4.33333H15V3H13Z" fill="currentColor"/>
    </IconBase>
  );
});

ImageAddIcon.displayName = 'ImageAddIcon';
