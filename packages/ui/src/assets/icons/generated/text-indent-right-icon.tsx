import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TextIndentRightIcon = React.memo(function TextIndentRightIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M2 14H14V12.6667H2V14ZM2 5.33333V10.6667L4.66667 8L2 5.33333ZM7.33333 11.3333H14V10H7.33333V11.3333ZM2 2V3.33333H14V2H2ZM7.33333 6H14V4.66667H7.33333V6ZM7.33333 8.66667H14V7.33333H7.33333V8.66667Z" fill="currentColor"/>
    </IconBase>
  );
});

TextIndentRightIcon.displayName = 'TextIndentRightIcon';
