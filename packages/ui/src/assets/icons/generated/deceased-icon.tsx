import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const DeceasedIcon = React.memo(function DeceasedIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.6267 2.99C5.54003 8.01667 9.1267 11.2633 11.7334 12.19C10.8067 12.9167 9.65336 13.33 8.4467 13.33C5.5067 13.33 3.11336 10.9367 3.11336 7.99667C3.11336 5.69667 4.58003 3.73 6.6267 2.99ZM8.44003 1.33667C4.71336 1.33667 1.78003 4.35667 1.78003 7.99667C1.78003 11.6767 4.7667 14.6633 8.4467 14.6633C10.92 14.6633 13.0667 13.3167 14.22 11.3167C9.21336 11.15 6.16003 5.69667 8.67336 1.33667H8.44003Z" fill="currentColor"/>
    </IconBase>
  );
});

DeceasedIcon.displayName = 'DeceasedIcon';
