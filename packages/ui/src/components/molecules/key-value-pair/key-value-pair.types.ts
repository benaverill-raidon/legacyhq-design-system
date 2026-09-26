import type * as React from 'react';

export type KeyValuePairSize = 'sm' | 'md' | 'lg';

export interface KeyValuePairProps {
  /** The key / label text displayed on the leading side of the row. */
  label: string;
  /**
   * Static value text. Used when the pair is read-only (`context=static` in Figma). Ignored when
   * `children` are provided — pass a TextField, TextArea, or Select with `appearance="inline"` as
   * children for editable pairs.
   */
  value?: React.ReactNode;
  /** Controls typography and vertical padding. */
  size?: KeyValuePairSize;
  /** Show a bottom divider line separating this pair from the next. */
  underline?: boolean;
  className?: string;
  /**
   * Editable value control. Pass a TextField, TextArea, or Select with `appearance="inline"` for
   * inline editing. When provided, `value` is ignored.
   */
  children?: React.ReactNode;
}
