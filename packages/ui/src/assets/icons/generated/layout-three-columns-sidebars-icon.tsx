import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const LayoutThreeColumnsSidebarsIcon = React.memo(function LayoutThreeColumnsSidebarsIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M13.3333 2.6665H2.66665C1.93331 2.6665 1.33331 3.2665 1.33331 3.99984V11.9998C1.33331 12.7332 1.93331 13.3332 2.66665 13.3332H13.3333C14.0666 13.3332 14.6666 12.7332 14.6666 11.9998V3.99984C14.6666 3.2665 14.0666 2.6665 13.3333 2.6665ZM2.66665 11.9998V3.99984H3.99998V11.9998H2.66665ZM5.33331 11.9998V3.99984H10.6666V11.9998H5.33331ZM13.3333 11.9998H12V3.99984H13.3333V11.9998Z" fill="currentColor"/>
    </IconBase>
  );
});

LayoutThreeColumnsSidebarsIcon.displayName = 'LayoutThreeColumnsSidebarsIcon';
