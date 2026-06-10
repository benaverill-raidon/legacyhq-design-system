import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ExpandHorizontalIcon = React.memo(function ExpandHorizontalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2.66669 13.3332L2.66669 2.6665L1.33335 2.6665L1.33335 13.3332L2.66669 13.3332Z" fill="currentColor"/>
<path d="M14.6667 13.3332L14.6667 2.6665L13.3334 2.6665L13.3334 13.3332L14.6667 13.3332Z" fill="currentColor"/>
<path d="M6.94002 6.27317L6.00002 5.33317L3.33335 7.99984L6.00002 10.6665L6.94002 9.7265L5.88669 8.6665L10.1134 8.6665L9.06002 9.7265L10 10.6665L12.6667 7.99984L10 5.33317L9.06002 6.27317L10.1134 7.33317L5.88669 7.33317L6.94002 6.27317Z" fill="currentColor"/>
    </IconBase>
  );
});

ExpandHorizontalIcon.displayName = 'ExpandHorizontalIcon';
