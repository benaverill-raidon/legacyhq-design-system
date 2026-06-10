import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const TagIcon = React.memo(function TagIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M11.42 3.89301C11.18 3.55301 10.78 3.33301 10.3334 3.33301L3.00002 3.33967C2.26669 3.33967 1.66669 3.93301 1.66669 4.66634V11.333C1.66669 12.0663 2.26669 12.6597 3.00002 12.6597L10.3334 12.6663C10.78 12.6663 11.18 12.4463 11.42 12.1063L14.3334 7.99967L11.42 3.89301ZM10.3334 11.333H3.00002V4.66634H10.3334L12.7 7.99967L10.3334 11.333Z" fill="currentColor"/>
    </IconBase>
  );
});

TagIcon.displayName = 'TagIcon';
