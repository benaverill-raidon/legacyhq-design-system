import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const MinimizeIcon = React.memo(function MinimizeIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4 7.3335H12V8.66683H4V7.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

MinimizeIcon.displayName = 'MinimizeIcon';
