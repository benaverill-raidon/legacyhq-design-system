import type * as React from 'react';

export type FormFooterAlign = 'start' | 'end';

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'title'> {
  /**
   * The header title, at `heading/lg`. It renders as text in a `div`, not as a heading, and doesn't
   * name the form.
   */
  title?: React.ReactNode;
  /** Supporting text under the title, at `body/md`. */
  description?: React.ReactNode;
  /**
   * Adds the "* indicates a required field" line to the header, with the `*` in the error color, the
   * same `*` Field shows on a required field. Independent of `description`.
   */
  requiredLegend?: boolean;
  /**
   * The legend's text after the `*`, shown with `requiredLegend`. Defaults to `indicates a required
   * field`; pass a translation.
   */
  requiredLegendLabel?: string;
  /** The form body: FormSections, and a FormFooter for the actions. */
  children?: React.ReactNode;
  /** Added to the header's classes. */
  headerClassName?: string;
}

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional title above the section's fields, at `heading/sm`. Text in a `div`, not a heading. */
  title?: React.ReactNode;
  /** The section body: Fields stacked one per line, and FormRows. */
  children?: React.ReactNode;
  /** Added to the section title's classes. */
  titleClassName?: string;
}

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The fields, as equal-width columns on one line (Figma designs up to 4). Each direct child is one
   * column, and the row stays on one line at every width.
   */
  children?: React.ReactNode;
}

export interface FormFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which side the actions sit on: `end` (right, the default) or `start` (left). */
  align?: FormFooterAlign;
  /** The actions, usually Buttons: a submit Button and often a Cancel. */
  children?: React.ReactNode;
}
