import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PanelLeftIcon = React.memo(function PanelLeftIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13.3333 2.6665C14.0697 2.6665 14.6666 3.26346 14.6666 3.99984V11.9998C14.6666 12.7362 14.0697 13.3332 13.3333 13.3332H2.66665C1.93027 13.3332 1.33331 12.7362 1.33331 11.9998V3.99984C1.33331 3.26346 1.93027 2.6665 2.66665 2.6665H13.3333ZM2.66665 5.77984H4.33331V3.99984H2.66665V5.77984ZM4.33331 7.11317H2.66665V8.89317H4.33331V7.11317ZM13.3333 3.99984H5.66665V11.9998H13.3333V3.99984ZM4.33331 11.9998V10.2198H2.66665V11.9998H4.33331Z" fill="currentColor"/>
    </IconBase>
  );
});

PanelLeftIcon.displayName = 'PanelLeftIcon';
