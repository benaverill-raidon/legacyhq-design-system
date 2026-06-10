import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const UploadIcon = React.memo(function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M5.99998 10.9997H9.99998V6.99967H12.6666L7.99998 2.33301L3.33331 6.99967H5.99998V10.9997ZM7.99998 4.21967L9.44665 5.66634H8.66665V9.66634H7.33331V5.66634H6.55331L7.99998 4.21967ZM3.33331 12.333H12.6666V13.6663H3.33331V12.333Z" fill="currentColor"/>
    </IconBase>
  );
});

UploadIcon.displayName = 'UploadIcon';
