import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LayoutThreeColumnsIcon = React.memo(function LayoutThreeColumnsIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2 3.3335V12.6668H14V3.3335H2ZM5.55333 11.3335H3.33333V4.66683H5.55333V11.3335ZM9.11333 11.3335H6.89333V4.66683H9.11333V11.3335ZM12.6667 11.3335H10.4467V4.66683H12.6667V11.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

LayoutThreeColumnsIcon.displayName = 'LayoutThreeColumnsIcon';
