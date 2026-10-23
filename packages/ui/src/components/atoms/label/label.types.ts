import * as React from 'react';

export type LabelSize = 'sm' | 'md';

export type LabelTone =
  | 'default'
  | 'information'
  | 'warning'
  | 'error'
  | 'success'
  | 'law'
  | 'wealth';

export type LabelEmphasis = 'subtle' | 'bold';

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The text: a status or a state in one to three words. Required. It renders in the case you pass and doesn't wrap. */
  children: React.ReactNode;
  /** `md`, the default, sets the text in `heading-xs`; `sm` uses `heading-xxs` and less padding, for dense tables and compact cards. */
  size?: LabelSize;
  /**
   * What the label means: `default` is neutral; `information`, `warning`, `error`, and `success` are
   * statuses; `law` and `wealth` say whether an item belongs to law or wealth.
   */
  tone?: LabelTone;
  /** How much it stands out, separate from what it means: `subtle`, the default, is a tinted fill, and `bold` is a solid fill. */
  emphasis?: LabelEmphasis;
}
