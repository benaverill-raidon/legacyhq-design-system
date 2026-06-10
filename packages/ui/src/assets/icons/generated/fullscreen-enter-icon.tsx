import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const FullscreenEnterIcon = React.memo(function FullscreenEnterIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.66665 9.3335H3.33331V12.6668H6.66665V11.3335H4.66665V9.3335ZM3.33331 6.66683H4.66665V4.66683H6.66665V3.3335H3.33331V6.66683ZM11.3333 11.3335H9.33331V12.6668H12.6666V9.3335H11.3333V11.3335ZM9.33331 3.3335V4.66683H11.3333V6.66683H12.6666V3.3335H9.33331Z" fill="currentColor"/>
    </IconBase>
  );
});

FullscreenEnterIcon.displayName = 'FullscreenEnterIcon';
