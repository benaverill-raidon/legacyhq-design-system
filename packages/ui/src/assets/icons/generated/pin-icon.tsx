import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const PinIcon = React.memo(function PinIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M9.33337 2.66683V6.00016C9.33337 6.74683 9.58004 7.44016 10 8.00016H6.00004C6.43337 7.42683 6.66671 6.7335 6.66671 6.00016V2.66683H9.33337ZM11.3334 1.3335H4.66671C4.30004 1.3335 4.00004 1.6335 4.00004 2.00016C4.00004 2.36683 4.30004 2.66683 4.66671 2.66683H5.33337V6.00016C5.33337 7.10683 4.44004 8.00016 3.33337 8.00016V9.3335H7.31337V14.0002L7.98004 14.6668L8.64671 14.0002V9.3335H12.6667V8.00016C11.56 8.00016 10.6667 7.10683 10.6667 6.00016V2.66683H11.3334C11.7 2.66683 12 2.36683 12 2.00016C12 1.6335 11.7 1.3335 11.3334 1.3335Z" fill="currentColor"/>
    </IconBase>
  );
});

PinIcon.displayName = 'PinIcon';
