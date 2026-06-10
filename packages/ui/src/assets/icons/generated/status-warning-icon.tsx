import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const StatusWarningIcon = React.memo(function StatusWarningIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.00002 4.32699L13.02 13.0003H2.98002L8.00002 4.32699ZM8.00002 1.66699L0.666687 14.3337H15.3334L8.00002 1.66699ZM8.66669 11.0003H7.33335V12.3337H8.66669V11.0003ZM8.66669 7.00033H7.33335V9.66699H8.66669V7.00033Z" fill="currentColor"/>
    </IconBase>
  );
});

StatusWarningIcon.displayName = 'StatusWarningIcon';
