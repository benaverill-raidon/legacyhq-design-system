import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PriorityMediumIcon = React.memo(function PriorityMediumIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13.3334 6H2.66669V7.33333H13.3334V6ZM2.66669 10H13.3334V8.66667H2.66669V10Z" fill="currentColor"/>
    </IconBase>
  );
});

PriorityMediumIcon.displayName = 'PriorityMediumIcon';
