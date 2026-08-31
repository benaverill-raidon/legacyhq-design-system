import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../atoms/avatar';
import { AvatarGroup } from '../avatar-group';
import { DocumentsIcon, FolderIcon, PersonIcon, RoadmapIcon, TeamAndPartnersIcon } from '../../../assets/icons';
import { RichTextArea } from './rich';
import type { EntityOption, EntitySection, RichTextValue } from './rich';

const meta = {
  title: 'UI/Molecules/Text Area/Rich Inline',
  component: RichTextArea,
  // Stories drive their own state via `render`; these satisfy the required props on the type.
  args: { value: [], onChange: () => {}, onSearch: () => [] },
} satisfies Meta<typeof RichTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const entityConfig = {
  account: { tone: 'blue' as const, icon: <TeamAndPartnersIcon decorative /> },
  person: { tone: 'blue' as const, icon: <PersonIcon decorative /> },
  matter: { tone: 'teal' as const, icon: <FolderIcon decorative /> },
  roadmap: { tone: 'purple' as const, icon: <RoadmapIcon decorative /> },
  document: { tone: 'default' as const, icon: <DocumentsIcon decorative /> },
};

const ACCOUNTS: EntityOption[] = [
  {
    id: 'a1',
    entityType: 'account',
    label: 'Averill, Ben & Jess',
    href: '#a1',
    leadingElement: <AvatarGroup size="xs" avatars={[{ id: 'ben', name: 'Ben Averill' }, { id: 'jess', name: 'Jess Averill' }]} />,
  },
  { id: 'a2', entityType: 'account', label: 'Ben Averill', href: '#a2', leadingElement: <Avatar name="Ben Averill" size="xs" decorative /> },
  { id: 'a3', entityType: 'account', label: 'Jess Averill', href: '#a3', leadingElement: <Avatar name="Jess Averill" size="xs" decorative /> },
];
const ROADMAPS: EntityOption[] = [{ id: 'r1', entityType: 'roadmap', label: "Ben's Planning Roadmap", href: '#r1' }];
const DOCS: EntityOption[] = [
  { id: 'd1', entityType: 'document', label: 'Benjamin Averill Last Will and Testament', href: '#d1' },
  { id: 'd2', entityType: 'document', label: 'Estate of Benjamin Averill', href: '#d2' },
];

/** Recents shown when the picker opens with an empty query (mixed types, no heading icon). */
const RECENTS: EntitySection[] = [
  {
    id: 'recents',
    heading: 'Recents',
    entityType: '',
    items: [
      { id: 'm1', entityType: 'matter', label: 'Averill Living Trust', href: '#m1' },
      { id: 'r1', entityType: 'roadmap', label: "Ben's Planning Roadmap", href: '#r1' },
      { id: 'a4', entityType: 'account', label: "Ben's Savings Account", href: '#a4' },
    ],
  },
];

/** Fake async search over the mock data - grouped by entity type, like the Figma. */
function search(query: string): Promise<EntitySection[]> {
  const q = query.trim().toLowerCase();
  const match = (items: typeof ACCOUNTS) => items.filter((i) => i.label.toLowerCase().includes(q));
  const sections: EntitySection[] = [
    { id: 'accounts', heading: 'Families and People', entityType: 'account', items: match(ACCOUNTS) },
    { id: 'roadmaps', heading: 'Roadmaps', entityType: 'roadmap', items: match(ROADMAPS) },
    { id: 'documents', heading: 'Estate Documents', entityType: 'document', items: match(DOCS) },
  ].filter((s) => s.items.length > 0);
  return new Promise((resolve) => setTimeout(() => resolve(sections), 120));
}

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-lg)', maxInlineSize: '440px' };
const caption: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};
const readout: CSSProperties = {
  ...caption,
  fontFamily: 'var(--typography-code-md-font-family, monospace)',
  whiteSpace: 'pre-wrap',
  background: 'var(--color-elevation-surface-sunken, transparent)',
  padding: 'var(--spacing-sm)',
  borderRadius: 'var(--border-radius-md)',
};

function serialize(value: RichTextValue) {
  return value.map((n) => (n.type === 'text' ? JSON.stringify(n.text) : `@${n.entity.label}`)).join(' ');
}

function PlaygroundDemo() {
  const [value, setValue] = useState<RichTextValue>([{ type: 'text', text: '' }]);
  return (
    <div style={stack}>
      <RichTextArea
        value={value}
        onChange={setValue}
        onSearch={search}
        recents={RECENTS}
        entityConfig={entityConfig}
        placeholder="Write a note. Type / to link an account, matter, roadmap, or document."
        aria-label="Note"
        rows={4}
      />
      <span style={caption}>Value (structured node array):</span>
      <div style={readout}>{serialize(value) || '(empty)'}</div>
    </div>
  );
}

function PrefilledDemo() {
  const [value, setValue] = useState<RichTextValue>([
    { type: 'text', text: 'Follow up with ' },
    { type: 'entity', entity: { id: 'a2', entityType: 'account', label: 'Ben Averill', href: '#a2' } },
    { type: 'text', text: ' about the ' },
    { type: 'entity', entity: { id: 'm1', entityType: 'matter', label: 'Averill Living Trust', href: '#m1' } },
    { type: 'text', text: ' before Friday.' },
  ]);
  return (
    <div style={stack}>
      <RichTextArea value={value} onChange={setValue} onSearch={search} recents={RECENTS} entityConfig={entityConfig} aria-label="Note" rows={3} />
      <div style={readout}>{serialize(value)}</div>
    </div>
  );
}

function StatesDemo() {
  const [a, setA] = useState<RichTextValue>([{ type: 'text', text: 'This note needs attention' }]);
  const [b, setB] = useState<RichTextValue>([{ type: 'text', text: 'Read-only note' }]);
  return (
    <div style={stack}>
      <RichTextArea value={a} onChange={setA} onSearch={search} recents={RECENTS} entityConfig={entityConfig} invalid aria-label="Invalid" rows={2} />
      <RichTextArea value={b} onChange={setB} onSearch={search} recents={RECENTS} entityConfig={entityConfig} disabled aria-label="Disabled" rows={2} />
    </div>
  );
}

/** Type `/` (at the start or after a space) to open the picker, then search and pick an entity. */
export const Playground: Story = { render: () => <PlaygroundDemo /> };

/** Loads with existing text and tags, proving the value round-trips. */
export const Prefilled: Story = { render: () => <PrefilledDemo /> };

/** Invalid and disabled reuse Text Area's frame treatment. */
export const States: Story = { render: () => <StatesDemo /> };
