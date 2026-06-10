import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ThemeIcon = React.memo(function ThemeIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M7.99998 14.6663C11.68 14.6663 14.6666 11.6797 14.6666 7.99967C14.6666 4.31967 11.68 1.33301 7.99998 1.33301C4.31998 1.33301 1.33331 4.31967 1.33331 7.99967C1.33331 11.6797 4.31998 14.6663 7.99998 14.6663ZM8.66665 2.71301C11.2933 3.03967 13.3333 5.27967 13.3333 7.99967C13.3333 10.7197 11.3 12.9597 8.66665 13.2863V2.71301Z" fill="currentColor"/>
    </IconBase>
  );
});

ThemeIcon.displayName = 'ThemeIcon';
