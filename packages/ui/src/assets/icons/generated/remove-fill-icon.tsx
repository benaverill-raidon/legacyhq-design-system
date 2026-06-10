import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const RemoveFillIcon = React.memo(function RemoveFillIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.99998 1.33301C11.6866 1.33301 14.6666 4.31301 14.6666 7.99967C14.6666 11.6863 11.6866 14.6663 7.99998 14.6663C4.31331 14.6663 1.33331 11.6863 1.33331 7.99967C1.33331 4.31301 4.31331 1.33301 7.99998 1.33301ZM7.99998 7.05957L5.60675 4.66634L4.66665 5.60644L7.05988 7.99967L4.66665 10.3929L5.60675 11.333L7.99998 8.93978L10.3932 11.333L11.3333 10.3929L8.94008 7.99967L11.3333 5.60644L10.3932 4.66634L7.99998 7.05957Z" fill="currentColor"/>
    </IconBase>
  );
});

RemoveFillIcon.displayName = 'RemoveFillIcon';
