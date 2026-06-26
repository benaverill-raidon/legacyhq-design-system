import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const RadioCheckedIcon = React.memo(function RadioCheckedIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 3.33333C5.42267 3.33333 3.33333 5.42267 3.33333 8C3.33333 10.5773 5.42267 12.6667 8 12.6667C10.5773 12.6667 12.6667 10.5773 12.6667 8C12.6667 5.42267 10.5773 3.33333 8 3.33333ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8ZM8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8C10.6667 6.52724 9.47276 5.33333 8 5.33333C6.52724 5.33333 5.33333 6.52724 5.33333 8C5.33333 9.47276 6.52724 10.6667 8 10.6667Z" fill="currentColor"/>
    </IconBase>
  );
});

RadioCheckedIcon.displayName = 'RadioCheckedIcon';
