import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const GrowVerticalIcon = React.memo(function GrowVerticalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.66665 4.66H10.6666L7.99998 2L5.33331 4.66H7.33331V11.34H5.33331L7.99998 14L10.6666 11.34H8.66665V4.66Z" fill="currentColor"/>
    </IconBase>
  );
});

GrowVerticalIcon.displayName = 'GrowVerticalIcon';
