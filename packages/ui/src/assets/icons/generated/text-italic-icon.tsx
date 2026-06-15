import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TextItalicIcon = React.memo(function TextItalicIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M6.66667 3.33301V5.33301H8.14L5.86 10.6663H4V12.6663H9.33333V10.6663H7.86L10.14 5.33301H12V3.33301H6.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

TextItalicIcon.displayName = 'TextItalicIcon';
