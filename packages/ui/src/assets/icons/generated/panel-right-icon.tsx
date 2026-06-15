import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PanelRightIcon = React.memo(function PanelRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2.66665 2.6665C1.93027 2.6665 1.33331 3.26346 1.33331 3.99984V11.9998C1.33331 12.7362 1.93027 13.3332 2.66665 13.3332H13.3333C14.0697 13.3332 14.6666 12.7362 14.6666 11.9998V3.99984C14.6666 3.26346 14.0697 2.6665 13.3333 2.6665H2.66665ZM13.3333 5.77984H11.6666V3.99984H13.3333V5.77984ZM11.6666 7.11317H13.3333V8.89317H11.6666V7.11317ZM2.66665 3.99984H10.3333V11.9998H2.66665V3.99984ZM11.6666 11.9998V10.2198H13.3333V11.9998H11.6666Z" fill="currentColor"/>
    </IconBase>
  );
});

PanelRightIcon.displayName = 'PanelRightIcon';
