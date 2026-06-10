import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const InvestmentAccountIcon = React.memo(function InvestmentAccountIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.66663 13.3332H9.33329V2.6665H6.66663V13.3332ZM2.66663 13.3332H5.33329V7.99984H2.66663V13.3332ZM10.6666 5.99984V13.3332H13.3333V5.99984H10.6666Z" fill="currentColor"/>
    </IconBase>
  );
});

InvestmentAccountIcon.displayName = 'InvestmentAccountIcon';
