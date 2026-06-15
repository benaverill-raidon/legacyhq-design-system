import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const CommentIcon = React.memo(function CommentIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M14.66 2.66683C14.66 1.9335 14.0666 1.3335 13.3333 1.3335H2.66665C1.93331 1.3335 1.33331 1.9335 1.33331 2.66683V10.6668C1.33331 11.4002 1.93331 12.0002 2.66665 12.0002H12L14.6666 14.6668L14.66 2.66683ZM13.3333 2.66683V11.4468L12.5533 10.6668H2.66665V2.66683H13.3333ZM3.99998 8.00016H12V9.3335H3.99998V8.00016ZM3.99998 6.00016H12V7.3335H3.99998V6.00016ZM3.99998 4.00016H12V5.3335H3.99998V4.00016Z" fill="currentColor"/>
    </IconBase>
  );
});

CommentIcon.displayName = 'CommentIcon';
