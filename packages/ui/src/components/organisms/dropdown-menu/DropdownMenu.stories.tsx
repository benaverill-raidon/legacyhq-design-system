import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { ArchiveIcon, CopyIcon, DeleteIcon, EditIcon, MoreVertIcon } from '../../../assets/icons';
import { DropdownMenu } from './dropdown-menu';
import type { DropdownMenuAlignment } from './dropdown-menu.types';
import type { MenuItem } from '../menu';

const meta = {
  title: 'Components/Actions/Dropdown Menu',
  component: DropdownMenu,
  args: {
    sections: [],
    open: false,
    children: <button type="button">Trigger</button>,
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 'var(--spacing-3xl)',
};

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const spread: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3
        style={{
          margin: 0,
          font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
          color: 'var(--color-content-default)',
        }}
      >
        {title}
      </h3>
      <div style={row}>{children}</div>
    </section>
  );
}

// spacing="spacious" centers the 16x16 (size="md", the Icon default) glyph in a 24x24 box, matching
// Figma's <elemBefore> exactly.
function actionItems(): MenuItem[] {
  return [
    { id: 'rename', label: 'Rename', leadingElement: <EditIcon spacing="spacious" decorative /> },
    { id: 'duplicate', label: 'Duplicate', leadingElement: <CopyIcon spacing="spacious" decorative /> },
    { id: 'archive', label: 'Archive', leadingElement: <ArchiveIcon spacing="spacious" decorative /> },
    { id: 'delete', label: 'Delete', leadingElement: <DeleteIcon spacing="spacious" decorative /> },
  ];
}

/** Interactive - click the trigger, use arrow keys inside the panel, select an item to close it. */
export const Playground: Story = {
  render: () => {
    function PlaygroundDropdown() {
      const [open, setOpen] = React.useState(false);

      const items: MenuItem[] = actionItems().map((item) => ({
        ...item,
        onSelect: () => setOpen(false),
      }));

      return (
        <DropdownMenu
          aria-label="Matter actions"
          open={open}
          onOpenChange={setOpen}
          searchPlaceholder="Search actions"
          sections={[{ id: 'actions', heading: 'Actions', items }]}
        >
          <Button isExpanded={open} onClick={() => setOpen((current) => !current)}>
            Actions
          </Button>
        </DropdownMenu>
      );
    }

    return <PlaygroundDropdown />;
  },
};

/** `alignment` (start/center/end) always opens below the trigger, matching Figma exactly - Popup's own viewport-fit fallback still applies underneath if there's no room below. */
export const Alignment: Story = {
  render: () => {
    function AlignmentDropdown({ alignment }: { alignment: DropdownMenuAlignment }) {
      const [open, setOpen] = React.useState(true);

      return (
        <DropdownMenu
          aria-label={`Actions (${alignment})`}
          open={open}
          onOpenChange={setOpen}
          alignment={alignment}
          showSearch={false}
          sections={[{ id: 'actions', items: actionItems() }]}
        >
          <Button isExpanded={open} onClick={() => setOpen((current) => !current)}>
            {alignment}
          </Button>
        </DropdownMenu>
      );
    }

    // Spread across the width so the three open panels don't overlap one another.
    return (
      <div style={spread}>
        <AlignmentDropdown alignment="start" />
        <AlignmentDropdown alignment="center" />
        <AlignmentDropdown alignment="end" />
      </div>
    );
  },
  // On the Docs page the open panels would float over the page, so the story renders in its own
  // frame there, tall enough to hold them.
  parameters: { docs: { story: { inline: false, height: '280px' } } },
};

/** Any focusable control works as the trigger, matching Figma's own range (button, icon-button, avatar, tag, chip, ...). */
export const Content: Story = {
  render: () => {
    function IconButtonTriggerDropdown() {
      const [open, setOpen] = React.useState(false);
      return (
        <DropdownMenu
          aria-label="Row actions"
          open={open}
          onOpenChange={setOpen}
          showSearch={false}
          sections={[{ id: 'actions', items: actionItems().map((item) => ({ ...item, onSelect: () => setOpen(false) })) }]}
        >
          <IconButton aria-label="Row actions" appearance="subtle" isExpanded={open} onClick={() => setOpen((current) => !current)}>
            <MoreVertIcon size="sm" decorative />
          </IconButton>
        </DropdownMenu>
      );
    }

    function AvatarTriggerDropdown() {
      const [open, setOpen] = React.useState(false);
      return (
        <DropdownMenu
          aria-label="Account menu"
          open={open}
          onOpenChange={setOpen}
          showSearch={false}
          sections={[
            {
              id: 'account',
              items: [
                { id: 'profile', label: 'View profile', onSelect: () => setOpen(false) },
                { id: 'sign-out', label: 'Sign out', onSelect: () => setOpen(false) },
              ],
            },
          ]}
        >
          <Avatar name="Jordan Ellis" isInteractive onClick={() => setOpen((current) => !current)} />
        </DropdownMenu>
      );
    }

    return (
      <Group title="Trigger variety">
        <IconButtonTriggerDropdown />
        <AvatarTriggerDropdown />
      </Group>
    );
  },
};

/** Selection closing the dropdown, and multiple sections in one panel. */
export const EdgeCases: Story = {
  render: () => {
    function MultiSectionDropdown() {
      const [open, setOpen] = React.useState(true);

      return (
        <DropdownMenu
          aria-label="Matter actions"
          open={open}
          onOpenChange={setOpen}
          showSearch={false}
          sections={[
            { id: 'actions', heading: 'Actions', items: actionItems().map((item) => ({ ...item, onSelect: () => setOpen(false) })) },
            {
              id: 'danger',
              heading: 'Danger zone',
              items: [
                {
                  id: 'delete-permanently',
                  label: 'Delete permanently',
                  leadingElement: <DeleteIcon spacing="spacious" decorative />,
                  onSelect: () => setOpen(false),
                },
              ],
            },
          ]}
        >
          <Button isExpanded={open} onClick={() => setOpen((current) => !current)}>
            Actions
          </Button>
        </DropdownMenu>
      );
    }

    return (
      <div style={stack}>
        <Group title="Multiple sections, closes on select">
          <p style={captionStyle}>Choosing any row closes the menu, from that item&apos;s own onSelect.</p>
          <MultiSectionDropdown />
        </Group>
      </div>
    );
  },
  // Open on load: on the Docs page it renders in its own frame so the panel doesn't float over the page.
  parameters: { docs: { story: { inline: false, height: '440px' } } },
};
