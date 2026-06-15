import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const FolderAddIcon = React.memo(function FolderAddIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13.3333 3.99984H7.99998L6.66665 2.6665H2.66665C1.92665 2.6665 1.33998 3.25984 1.33998 3.99984L1.33331 11.9998C1.33331 12.7398 1.92665 13.3332 2.66665 13.3332H13.3333C14.0733 13.3332 14.6666 12.7398 14.6666 11.9998V5.33317C14.6666 4.59317 14.0733 3.99984 13.3333 3.99984ZM13.3333 11.9998H2.66665V3.99984H6.11331L7.44665 5.33317H13.3333V11.9998ZM7.99998 9.33317H9.33331V10.6665H10.6666V9.33317H12V7.99984H10.6666V6.6665H9.33331V7.99984H7.99998V9.33317Z" fill="currentColor"/>
    </IconBase>
  );
});

FolderAddIcon.displayName = 'FolderAddIcon';
