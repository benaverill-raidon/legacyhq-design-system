import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const DeleteIcon = React.memo(function DeleteIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M10.6666 6V12.6667H5.33331V6H10.6666ZM9.66665 2H6.33331L5.66665 2.66667H3.33331V4H12.6666V2.66667H10.3333L9.66665 2ZM12 4.66667H3.99998V12.6667C3.99998 13.4 4.59998 14 5.33331 14H10.6666C11.4 14 12 13.4 12 12.6667V4.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

DeleteIcon.displayName = 'DeleteIcon';
