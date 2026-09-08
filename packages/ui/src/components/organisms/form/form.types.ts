import type * as React from 'react';

export type FormFooterAlign = 'start' | 'end';

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'title'> {
  /**
   * Form title, rendered in the header at `heading/lg`. Presentational text - wrap the form in your
   * page's own heading structure, or pass a heading element as the node, if you need semantics.
   */
  title?: React.ReactNode;
  /** Supporting description shown under the title at `body/md`. */
  description?: React.ReactNode;
  /**
   * Renders the standard "* indicates a required field" legend in the header, with the `*` in the
   * error colour - the same `*` Field shows on a required field. Independent of `description`.
   */
  requiredLegend?: boolean;
  /** The form body: FormSection / FormRow groups, and a FormFooter for the actions. */
  children?: React.ReactNode;
  /** Composes with the header's class list. */
  headerClassName?: string;
}

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional section heading, rendered at `heading/sm`. Omit for an untitled grouping. */
  title?: React.ReactNode;
  /** The section body: FormRows, or single controls (Fields) stacked one per line. */
  children?: React.ReactNode;
  /** Composes with the section title's class list. */
  titleClassName?: string;
}

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The fields laid out as equal-width columns on one line (Figma supports up to 4). Each direct
   * child becomes one column; on narrow viewports the row collapses to a single column.
   */
  children?: React.ReactNode;
}

export interface FormFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment of the actions. `end` (right) is the default; `start` aligns them left. */
  align?: FormFooterAlign;
  /** The footer actions - typically a Cancel and a submit Button. */
  children?: React.ReactNode;
}
