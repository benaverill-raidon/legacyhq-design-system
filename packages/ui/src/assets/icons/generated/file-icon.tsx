import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const FileIcon = React.memo(function FileIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9.33335 1.3335H4.00002C3.26669 1.3335 2.67335 1.9335 2.67335 2.66683L2.66669 13.3335C2.66669 14.0668 3.26002 14.6668 3.99335 14.6668H12C12.7334 14.6668 13.3334 14.0668 13.3334 13.3335V5.3335L9.33335 1.3335ZM4.00002 13.3335V2.66683H8.66669V6.00016H12V13.3335H4.00002Z" fill="currentColor"/>
    </IconBase>
  );
});

FileIcon.displayName = 'FileIcon';
