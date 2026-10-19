import * as React from 'react';
import { DocsContext } from '@storybook/addon-docs/blocks';
import { NAVIGATE_URL } from 'storybook/internal/core-events';
import { toId } from 'storybook/internal/csf';
import { Link } from '../../components/atoms/link';
import type { LinkProps } from '../../components/atoms/link';

// Link from a Storybook docs page to another docs page, addressed by its sidebar title
// (e.g. "Components/Actions/Button"). A plain click navigates inside Storybook the same way
// addon-docs handles markdown links; the href is a real top-level URL, so opening in a new tab
// still works. Write `to` as a string literal - doc-link.test.ts reads every DocLink statically
// and fails if a target isn't a real docs page.

export interface DocLinkProps extends Omit<LinkProps, 'href' | 'target' | 'children'> {
  /** Sidebar title of the target docs page. */
  to: string;
  /** Defaults to the title's last segment ("Components/Actions/Button" -> "Button"). */
  children?: React.ReactNode;
}

export function docLinkPath(to: string) {
  return `?path=/docs/${toId(to, 'docs')}`;
}

export function DocLink({ to, children, onClick, ...rest }: DocLinkProps) {
  const context = React.useContext(DocsContext);
  const path = docLinkPath(to);

  return (
    <Link
      {...rest}
      href={`./${path}`}
      target="_top"
      onClick={(event) => {
        onClick?.(event);
        const channel = context?.channel;
        const isPlainClick = event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
        if (event.defaultPrevented || !channel || !isPlainClick) return;
        event.preventDefault();
        channel.emit(NAVIGATE_URL, path);
      }}
    >
      {children ?? to.split('/').pop()}
    </Link>
  );
}
