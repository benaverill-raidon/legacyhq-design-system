import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LibraryAddIcon = React.memo(function LibraryAddIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2.66665 4.00016H1.33331V13.3335C1.33331 14.0668 1.93331 14.6668 2.66665 14.6668H12V13.3335H2.66665V4.00016ZM13.3333 1.3335H5.33331C4.59998 1.3335 3.99998 1.9335 3.99998 2.66683V10.6668C3.99998 11.4002 4.59998 12.0002 5.33331 12.0002H13.3333C14.0666 12.0002 14.6666 11.4002 14.6666 10.6668V2.66683C14.6666 1.9335 14.0666 1.3335 13.3333 1.3335ZM13.3333 10.6668H5.33331V2.66683H13.3333V10.6668ZM8.66665 9.3335H9.99998V7.3335H12V6.00016H9.99998V4.00016H8.66665V6.00016H6.66665V7.3335H8.66665V9.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

LibraryAddIcon.displayName = 'LibraryAddIcon';
