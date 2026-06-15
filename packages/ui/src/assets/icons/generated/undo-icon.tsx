import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const UndoIcon = React.memo(function UndoIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.1767 5.66667C6.41003 5.66667 4.81003 6.32667 3.5767 7.4L1.1767 5V11H7.1767L4.76336 8.58667C5.69003 7.81333 6.87003 7.33333 8.1767 7.33333C10.5367 7.33333 12.5434 8.87333 13.2434 11L14.8234 10.48C13.8967 7.68667 11.2767 5.66667 8.1767 5.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

UndoIcon.displayName = 'UndoIcon';
