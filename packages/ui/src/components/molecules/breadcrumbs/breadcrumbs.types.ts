import type * as React from 'react';

export interface BreadcrumbItem {
  /** The visible text for this level. Required. */
  label: React.ReactNode;
  /** Makes the item a Link to that level. Leave it off the current page, which renders as text. */
  href?: string;
  /** Passed to the Link. `_blank` adds Link's new-tab icon and hidden text. */
  target?: React.HTMLAttributeAnchorTarget;
  /** An icon before the label, hidden from assistive technology. */
  iconBefore?: React.ReactNode;
  /** An icon after the label, hidden from assistive technology. */
  iconAfter?: React.ReactNode;
  /** Passed to the Link, so only an item with an `href` calls it. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface BreadcrumbsProps {
  /**
   * The trail, root first and the current page last. An item with an `href` renders as a Link; one
   * without renders as text marked `aria-current="page"`.
   */
  items: BreadcrumbItem[];
  /** The `nav` landmark's accessible name. Defaults to "Breadcrumb". */
  ariaLabel?: string;
  /** Added to the root `nav`'s classes. */
  className?: string;
}
