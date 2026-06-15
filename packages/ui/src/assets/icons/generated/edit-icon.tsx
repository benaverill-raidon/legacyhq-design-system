import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const EditIcon = React.memo(function EditIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9.37248 6.01333L9.98581 6.62667L3.94581 12.6667H3.33248V12.0533L9.37248 6.01333ZM11.7725 2C11.6058 2 11.4325 2.06667 11.3058 2.19333L10.0858 3.41333L12.5858 5.91333L13.8058 4.69333C14.0658 4.43333 14.0658 4.01333 13.8058 3.75333L12.2458 2.19333C12.1125 2.06 11.9458 2 11.7725 2ZM9.37248 4.12667L1.99915 11.5V14H4.49915L11.8725 6.62667L9.37248 4.12667Z" fill="currentColor"/>
    </IconBase>
  );
});

EditIcon.displayName = 'EditIcon';
