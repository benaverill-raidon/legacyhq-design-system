import type * as React from 'react';

export type SectionMessageAppearance = 'information' | 'success' | 'warning' | 'error';

export interface SectionMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** Semantic appearance - sets the tinted background, border, and status icon. Defaults to `information`. */
  appearance?: SectionMessageAppearance;
  /** Optional bold title, shown above the description. Omit to render the description alone. */
  title?: React.ReactNode;
  /** The message body. */
  children: React.ReactNode;
  /**
   * Optional trailing actions - typically `Link` elements. Section Message inserts a middot
   * separator between each one.
   */
  actions?: React.ReactNode;
  /** Show a dismiss button in the top-right corner. Defaults to `false`. */
  isDismissible?: boolean;
  /** Called when the dismiss button is clicked. The message also hides itself. */
  onDismiss?: () => void;
}
