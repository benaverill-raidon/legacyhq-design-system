import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TransferIcon = React.memo(function TransferIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.66 7.3335L2 10.0002L4.66 12.6668V10.6668H9.33333V9.3335H4.66V7.3335ZM14 6.00016L11.34 3.3335V5.3335H6.66667V6.66683H11.34V8.66683L14 6.00016Z" fill="currentColor"/>
    </IconBase>
  );
});

TransferIcon.displayName = 'TransferIcon';
