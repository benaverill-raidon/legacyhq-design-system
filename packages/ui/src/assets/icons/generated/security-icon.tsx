import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const SecurityIcon = React.memo(function SecurityIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8 0.666992L2 3.33366V7.33366C2 11.0337 4.56 14.4937 8 15.3337C11.44 14.4937 14 11.0337 14 7.33366V3.33366L8 0.666992ZM8 7.99366H12.6667C12.3133 10.7403 10.48 13.187 8 13.9537V8.00033H3.33333V4.20033L8 2.12699V7.99366Z" fill="currentColor"/>
    </IconBase>
  );
});

SecurityIcon.displayName = 'SecurityIcon';
