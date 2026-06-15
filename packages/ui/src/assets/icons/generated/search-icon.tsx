import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const SearchIcon = React.memo(function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 16 16">
      <path d="M10.5033 9.50326H9.97665L9.78998 9.32326C10.4433 8.56326 10.8366 7.57659 10.8366 6.50326C10.8366 4.10992 8.89665 2.16992 6.50332 2.16992C4.10998 2.16992 2.16998 4.10992 2.16998 6.50326C2.16998 8.89659 4.10998 10.8366 6.50332 10.8366C7.57665 10.8366 8.56332 10.4433 9.32332 9.78992L9.50332 9.97659V10.5033L12.8366 13.8299L13.83 12.8366L10.5033 9.50326ZM6.50332 9.50326C4.84332 9.50326 3.50332 8.16326 3.50332 6.50326C3.50332 4.84326 4.84332 3.50326 6.50332 3.50326C8.16332 3.50326 9.50332 4.84326 9.50332 6.50326C9.50332 8.16326 8.16332 9.50326 6.50332 9.50326Z" fill="currentColor"/>
    </IconBase>
  );
});

SearchIcon.displayName = 'SearchIcon';
