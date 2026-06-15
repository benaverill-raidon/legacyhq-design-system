import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ListRemoveIcon = React.memo(function ListRemoveIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <g clipPath="url(#clip0_1499_1789)">
<path d="M8.66732 8.66667H8.66601L9.99935 10H10.0007L11.334 11.3333H11.3327L14.599 14.5996L13.6562 15.5423L9.44726 11.3333H4.66667V10H8.11393L6.7806 8.66667H4.66667V7.33333H5.44727L3.33333 5.2194V6H2V4.66667H2.7806L0.457031 2.3431L1.39974 1.40039L8.66732 8.66667Z" fill="currentColor"/>
<path d="M3.33333 11.3333H2V10H3.33333V11.3333Z" fill="currentColor"/>
<path d="M14 11.3333H13.2194L11.8861 10H14V11.3333Z" fill="currentColor"/>
<path d="M3.33333 8.66667H2V7.33333H3.33333V8.66667Z" fill="currentColor"/>
<path d="M14 8.66667H10.5527L9.2194 7.33333H14V8.66667Z" fill="currentColor"/>
<path d="M14 6H7.88607L6.55273 4.66667H14V6Z" fill="currentColor"/>
</g>
    </IconBase>
  );
});

ListRemoveIcon.displayName = 'ListRemoveIcon';
