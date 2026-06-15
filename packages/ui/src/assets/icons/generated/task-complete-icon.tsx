import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TaskCompleteIcon = React.memo(function TaskCompleteIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.00004 14.6668C11.6819 14.6668 14.6667 11.6821 14.6667 8.00016C14.6667 4.31826 11.6819 1.3335 8.00004 1.3335C4.31814 1.3335 1.33337 4.31826 1.33337 8.00016C1.33337 11.6821 4.31814 14.6668 8.00004 14.6668ZM6.66671 9.44688L11.06 5.05355L12 6.00021L6.66671 11.3335L4.00004 8.66688L4.94004 7.72688L6.66671 9.44688Z" fill="currentColor"/>
    </IconBase>
  );
});

TaskCompleteIcon.displayName = 'TaskCompleteIcon';
