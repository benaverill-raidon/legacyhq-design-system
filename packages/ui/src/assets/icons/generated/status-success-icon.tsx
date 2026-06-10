import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const StatusSuccessIcon = React.memo(function StatusSuccessIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M5.8667 10.5999L3.0667 7.79987L2.13336 8.7332L5.8667 12.4665L13.8667 4.46654L12.9334 3.5332L5.8667 10.5999Z" fill="currentColor"/>
    </IconBase>
  );
});

StatusSuccessIcon.displayName = 'StatusSuccessIcon';
