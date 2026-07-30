import type * as React from 'react';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  className?: string;
}
