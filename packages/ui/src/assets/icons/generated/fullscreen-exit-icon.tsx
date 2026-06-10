import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const FullscreenExitIcon = React.memo(function FullscreenExitIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M3.33331 10.6668H5.33331V12.6668H6.66665V9.3335H3.33331V10.6668ZM5.33331 5.3335H3.33331V6.66683H6.66665V3.3335H5.33331V5.3335ZM9.33331 12.6668H10.6666V10.6668H12.6666V9.3335H9.33331V12.6668ZM10.6666 5.3335V3.3335H9.33331V6.66683H12.6666V5.3335H10.6666Z" fill="currentColor"/>
    </IconBase>
  );
});

FullscreenExitIcon.displayName = 'FullscreenExitIcon';
