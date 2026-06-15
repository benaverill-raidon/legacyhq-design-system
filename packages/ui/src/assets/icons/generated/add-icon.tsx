import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const AddIcon = React.memo(function AddIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6666 8.66659H8.66665V12.6666H7.33331V8.66659H3.33331V7.33325H7.33331V3.33325H8.66665V7.33325H12.6666V8.66659Z" fill="currentColor"/>
    </IconBase>
  );
});

AddIcon.displayName = 'AddIcon';
