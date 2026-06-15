import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ExpandVerticalIcon = React.memo(function ExpandVerticalIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13.3334 13.3335H2.66669V14.6668H13.3334V13.3335Z" fill="currentColor"/>
<path d="M13.3334 1.3335H2.66669V2.66683H13.3334V1.3335Z" fill="currentColor"/>
<path d="M6.27335 9.06016L5.33335 10.0002L8.00002 12.6668L10.6667 10.0002L9.72669 9.06016L8.66669 10.1135V5.88683L9.72669 6.94016L10.6667 6.00016L8.00002 3.3335L5.33335 6.00016L6.27335 6.94016L7.33335 5.88683V10.1135L6.27335 9.06016Z" fill="currentColor"/>
    </IconBase>
  );
});

ExpandVerticalIcon.displayName = 'ExpandVerticalIcon';
