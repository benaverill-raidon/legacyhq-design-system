import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const AliveAndWellIcon = React.memo(function AliveAndWellIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.00004 14.1166L7.03337 13.2366C3.60004 10.1233 1.33337 8.06997 1.33337 5.54997C1.33337 3.49663 2.94671 1.8833 5.00004 1.8833C6.16004 1.8833 7.27337 2.4233 8.00004 3.27663C8.72671 2.4233 9.84004 1.8833 11 1.8833C13.0534 1.8833 14.6667 3.49663 14.6667 5.54997C14.6667 8.06997 12.4 10.1233 8.96671 13.2433L8.00004 14.1166Z" fill="currentColor"/>
    </IconBase>
  );
});

AliveAndWellIcon.displayName = 'AliveAndWellIcon';
