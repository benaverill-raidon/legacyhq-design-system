// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Breadcrumbs } from './breadcrumbs';
import type { BreadcrumbItem } from './breadcrumbs.types';

const breadcrumbsCss = readFileSync(
  'packages/ui/src/components/molecules/breadcrumbs/breadcrumbs.module.css',
  'utf8',
);

const items: BreadcrumbItem[] = [
  { label: 'Settings', href: '/settings' },
  { label: 'Account', href: '/settings/account' },
  { label: 'Security' },
];

afterEach(cleanup);

describe('Breadcrumbs', () => {
  it('renders one item per entry, in order', () => {
    render(<Breadcrumbs items={items} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('Settings');
    expect(listItems[1]).toHaveTextContent('Account');
    expect(listItems[2]).toHaveTextContent('Security');
  });

  it('does not render a separator before the first item', () => {
    render(<Breadcrumbs items={items} />);

    const [firstItem] = screen.getAllByRole('listitem');
    expect(within(firstItem).queryByText('/')).not.toBeInTheDocument();
  });

  it('renders a separator before every subsequent item', () => {
    render(<Breadcrumbs items={items} />);

    const listItems = screen.getAllByRole('listitem');
    expect(within(listItems[1]).getByText('/')).toBeInTheDocument();
    expect(within(listItems[2]).getByText('/')).toBeInTheDocument();
  });

  it('renders items with href as links', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/settings/account');
  });

  it('renders the item without href as non-interactive current-page text', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.queryByRole('link', { name: 'Security' })).not.toBeInTheDocument();
    expect(screen.getByText('Security').closest('[aria-current]')).toHaveAttribute('aria-current', 'page');
  });

  it('renders iconBefore and iconAfter when provided', () => {
    render(
      <Breadcrumbs
        items={[
          {
            label: 'Home',
            href: '/',
            iconBefore: <span data-testid="icon-before" />,
            iconAfter: <span data-testid="icon-after" />,
          },
          { label: 'Current' },
        ]}
      />,
    );

    expect(screen.getByTestId('icon-before')).toBeInTheDocument();
    expect(screen.getByTestId('icon-after')).toBeInTheDocument();
  });

  it('labels the nav "Breadcrumb" by default', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('supports a custom ariaLabel', () => {
    render(<Breadcrumbs items={items} ariaLabel="You are here" />);

    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument();
  });

  it('applies className to the root nav', () => {
    render(<Breadcrumbs items={items} className="custom-breadcrumbs" />);

    expect(screen.getByRole('navigation')).toHaveClass('custom-breadcrumbs');
  });

  it('renders a single item with no separator and as current-page text', () => {
    render(<Breadcrumbs items={[{ label: 'Dashboard' }]} />);

    expect(screen.queryByText('/')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard').closest('[aria-current]')).toHaveAttribute('aria-current', 'page');
  });

  it('uses the semantic sm spacing token between items', () => {
    expect(breadcrumbsCss).toContain('gap: var(--spacing-sm);');
  });
});
