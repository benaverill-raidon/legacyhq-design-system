import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const DownloadIcon = React.memo(function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6666 6.3335H9.99998V2.3335H5.99998V6.3335H3.33331L7.99998 11.0002L12.6666 6.3335ZM7.33331 7.66683V3.66683H8.66665V7.66683H9.44665L7.99998 9.1135L6.55331 7.66683H7.33331ZM3.33331 12.3335H12.6666V13.6668H3.33331V12.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

DownloadIcon.displayName = 'DownloadIcon';
