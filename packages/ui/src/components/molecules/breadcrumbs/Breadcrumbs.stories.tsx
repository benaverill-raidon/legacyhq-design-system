import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderIcon, HomeIcon } from '../../../assets/icons';
import { Breadcrumbs } from './breadcrumbs';
import type { BreadcrumbItem } from './breadcrumbs.types';

const defaultItems: BreadcrumbItem[] = [
  { label: 'Settings', href: '/settings' },
  { label: 'Account', href: '/settings/account' },
  { label: 'Security' },
];

const meta = {
  title: 'UI/Molecules/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: defaultItems,
    ariaLabel: 'Breadcrumb',
  },
  argTypes: {
    items: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {children}
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/** How Breadcrumbs behaves with realistic content and trail lengths. */
export const Composition: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Two-level trail">
        <Breadcrumbs items={[{ label: 'Settings', href: '/settings' }, { label: 'Account' }]} />
      </Group>

      <Group title="Deep trail">
        <Breadcrumbs items={defaultItems} />
      </Group>

      <Group title="With a leading icon">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/', iconBefore: <HomeIcon size="sm" /> },
            { label: 'Reports', href: '/reports', iconBefore: <FolderIcon size="sm" /> },
            { label: 'Q3 Summary' },
          ]}
        />
      </Group>

      <Group title="Single item (current page only)">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      </Group>

      <Group title="Custom accessible name">
        <Breadcrumbs
          ariaLabel="You are here"
          items={[{ label: 'Docs', href: '/docs' }, { label: 'Components' }]}
        />
      </Group>

      <Group title="In a page header">
        <div style={cardStyle}>
          <Breadcrumbs items={defaultItems} />
          <h2 style={headingStyle}>Security</h2>
          <p style={captionStyle}>Manage two-factor authentication and active sessions.</p>
        </div>
      </Group>
    </div>
  ),
};
