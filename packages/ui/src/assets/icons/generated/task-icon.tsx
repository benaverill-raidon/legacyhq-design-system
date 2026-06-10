import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TaskIcon = React.memo(function TaskIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M8.00004 1.3335C4.32004 1.3335 1.33337 4.32016 1.33337 8.00016C1.33337 11.6802 4.32004 14.6668 8.00004 14.6668C11.68 14.6668 14.6667 11.6802 14.6667 8.00016C14.6667 4.32016 11.68 1.3335 8.00004 1.3335ZM8.00004 13.3335C5.06004 13.3335 2.66671 10.9402 2.66671 8.00016C2.66671 5.06016 5.06004 2.66683 8.00004 2.66683C10.94 2.66683 13.3334 5.06016 13.3334 8.00016C13.3334 10.9402 10.94 13.3335 8.00004 13.3335ZM11.06 5.0535L6.66671 9.44683L4.94004 7.72683L4.00004 8.66683L6.66671 11.3335L12 6.00016L11.06 5.0535Z" fill="currentColor"/>
    </IconBase>
  );
});

TaskIcon.displayName = 'TaskIcon';
