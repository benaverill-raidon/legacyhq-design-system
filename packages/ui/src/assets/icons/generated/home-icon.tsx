import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const HomeIcon = React.memo(function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M7.99998 4.12683L11.3333 7.12683V12.3335H9.99998V8.3335H5.99998V12.3335H4.66665V7.12683L7.99998 4.12683ZM7.99998 2.3335L1.33331 8.3335H3.33331V13.6668H7.33331V9.66683H8.66665V13.6668H12.6666V8.3335H14.6666L7.99998 2.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

HomeIcon.displayName = 'HomeIcon';
