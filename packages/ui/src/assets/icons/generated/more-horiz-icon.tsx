import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const MoreHorizIcon = React.memo(function MoreHorizIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.00002 6.66699C3.26669 6.66699 2.66669 7.26699 2.66669 8.00033C2.66669 8.73366 3.26669 9.33366 4.00002 9.33366C4.73335 9.33366 5.33335 8.73366 5.33335 8.00033C5.33335 7.26699 4.73335 6.66699 4.00002 6.66699ZM12 6.66699C11.2667 6.66699 10.6667 7.26699 10.6667 8.00033C10.6667 8.73366 11.2667 9.33366 12 9.33366C12.7334 9.33366 13.3334 8.73366 13.3334 8.00033C13.3334 7.26699 12.7334 6.66699 12 6.66699ZM8.00002 6.66699C7.26669 6.66699 6.66669 7.26699 6.66669 8.00033C6.66669 8.73366 7.26669 9.33366 8.00002 9.33366C8.73335 9.33366 9.33335 8.73366 9.33335 8.00033C9.33335 7.26699 8.73335 6.66699 8.00002 6.66699Z" fill="currentColor"/>
    </IconBase>
  );
});

MoreHorizIcon.displayName = 'MoreHorizIcon';
