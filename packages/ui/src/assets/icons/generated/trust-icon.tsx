import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TrustIcon = React.memo(function TrustIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M4.66663 7.3335H3.33329V12.0002H4.66663V7.3335ZM8.66663 7.3335H7.33329V12.0002H8.66663V7.3335ZM14.3333 13.3335H1.66663V14.6668H14.3333V13.3335ZM12.6666 7.3335H11.3333V12.0002H12.6666V7.3335ZM7.99996 2.84016L11.4733 4.66683H4.52663L7.99996 2.84016ZM7.99996 1.3335L1.66663 4.66683V6.00016H14.3333V4.66683L7.99996 1.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

TrustIcon.displayName = 'TrustIcon';
