import * as React from 'react';

export type LabelSize = 'sm' | 'md';

export type LabelTone =
  | 'default'
  | 'information'
  | 'warning'
  | 'discovery'
  | 'error'
  | 'success'
  | 'law'
  | 'wealth';

export type LabelEmphasis = 'subtle' | 'bold';

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  size?: LabelSize;
  tone?: LabelTone;
  emphasis?: LabelEmphasis;
}
