import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const MaximizeIcon = React.memo(function MaximizeIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M12.6667 8H11.3334V10H9.33335V11.3333H12.6667V8ZM4.66669 6H6.66669V4.66667H3.33335V8H4.66669V6ZM14 2H2.00002C1.26669 2 0.666687 2.6 0.666687 3.33333V12.6667C0.666687 13.4 1.26669 14 2.00002 14H14C14.7334 14 15.3334 13.4 15.3334 12.6667V3.33333C15.3334 2.6 14.7334 2 14 2ZM14 12.6733H2.00002V3.32667H14V12.6733Z" fill="currentColor"/>
    </IconBase>
  );
});

MaximizeIcon.displayName = 'MaximizeIcon';
