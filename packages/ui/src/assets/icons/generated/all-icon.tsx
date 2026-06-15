import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const AllIcon = React.memo(function AllIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2.66663 5.33341H5.33329V2.66675H2.66663V5.33341ZM6.66663 13.3334H9.33329V10.6667H6.66663V13.3334ZM2.66663 13.3334H5.33329V10.6667H2.66663V13.3334ZM2.66663 9.33341H5.33329V6.66675H2.66663V9.33341ZM6.66663 9.33341H9.33329V6.66675H6.66663V9.33341ZM10.6666 2.66675V5.33341H13.3333V2.66675H10.6666ZM6.66663 5.33341H9.33329V2.66675H6.66663V5.33341ZM10.6666 9.33341H13.3333V6.66675H10.6666V9.33341ZM10.6666 13.3334H13.3333V10.6667H10.6666V13.3334Z" fill="currentColor"/>
    </IconBase>
  );
});

AllIcon.displayName = 'AllIcon';
