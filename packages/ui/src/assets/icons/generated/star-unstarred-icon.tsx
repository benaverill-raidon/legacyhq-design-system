import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const StarUnstarredIcon = React.memo(function StarUnstarredIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M14.6666 6.49366L9.87331 6.08033L7.99998 1.66699L6.12665 6.08699L1.33331 6.49366L4.97331 9.64699L3.87998 14.3337L7.99998 11.847L12.12 14.3337L11.0333 9.64699L14.6666 6.49366ZM7.99998 10.6003L5.49331 12.1137L6.15998 9.26033L3.94665 7.34033L6.86665 7.08699L7.99998 4.40033L9.13998 7.09366L12.06 7.34699L9.84665 9.26699L10.5133 12.1203L7.99998 10.6003Z" fill="currentColor"/>
    </IconBase>
  );
});

StarUnstarredIcon.displayName = 'StarUnstarredIcon';
