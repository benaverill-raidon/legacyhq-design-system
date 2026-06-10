import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TaskInProgressIcon = React.memo(function TaskInProgressIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.00004 1.3335C11.68 1.3335 14.6667 4.32016 14.6667 8.00016C14.6667 11.6802 11.68 14.6668 8.00004 14.6668C4.32004 14.6668 1.33337 11.6802 1.33337 8.00016C1.33337 4.32016 4.32004 1.3335 8.00004 1.3335ZM8.00004 2.66683C5.05337 2.66683 2.66671 5.0535 2.66671 8.00016C2.66671 10.9468 5.05337 13.3335 8.00004 13.3335C10.9467 13.3335 13.3334 10.9468 13.3334 8.00016C13.3334 5.0535 10.9467 2.66683 8.00004 2.66683Z" fill="currentColor"/>
<path d="M8.00004 4.00016C9.02671 4.00016 10.0469 4.39334 10.8269 5.17334C12.3935 6.73334 12.3934 9.26698 10.8334 10.827C10.0498 11.6071 9.02445 11.9965 8.00004 11.9963L8.00004 4.00016Z" fill="currentColor"/>
    </IconBase>
  );
});

TaskInProgressIcon.displayName = 'TaskInProgressIcon';
