import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarGroup } from './avatar-group';
import type { AvatarGroupItem, AvatarGroupSize } from './avatar-group.types';

/**
 * No `src` on any example avatar below, deliberately - these demonstrate the real, designed empty
 * states (Avatar's own fallback artwork), not stand-in photos. Individual clients get the default
 * `entityType="person"` fallback; team/partner entities (a firm, an outside counsel, a co-trustee
 * organization - not an individual) get `entityType="team"`.
 */
const CLIENT_NAMES = [
  'Ben Averill',
  'Jordan Ellis',
  'Priya Natarajan',
  'Marcus Webb',
  'Sofia Reyes',
  'Owen Fitzgerald',
  'Amara Okafor',
  'Liam Brennan',
];

const ENTITY_NAMES = ['Averill & Partners', 'Whitfield Trust Advisors', 'Northgate Co-Trustees'];

function clients(count: number): AvatarGroupItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `client-${index + 1}`,
    name: CLIENT_NAMES[index % CLIENT_NAMES.length],
  }));
}

function entities(count: number): AvatarGroupItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `entity-${index + 1}`,
    name: ENTITY_NAMES[index % ENTITY_NAMES.length],
    entityType: 'team' as const,
  }));
}

const meta = {
  title: 'UI/Molecules/Avatar Group',
  component: AvatarGroup,
  args: {
    avatars: clients(4),
    maxVisible: undefined,
    size: 'lg',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    maxVisible: { control: 'number' },
    avatars: { control: false },
    overflowLabel: { control: false },
    onOverflowAvatarSelect: { control: false },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-2xl)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {description ? <p style={captionStyle}>{description}</p> : null}
      {children}
    </section>
  );
}

/** Prop exploration. Pass more avatars than `maxVisible` to see the overflow trigger appear. */
export const Playground: Story = {};

/** No `maxVisible` - every avatar renders as an overlapping stack, at every size. */
export const Stack: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Clients (default entityType: person)">
        <div style={row}>
          {(['xs', 'sm', 'md', 'lg'] as AvatarGroupSize[]).map((size) => (
            <Group key={size} title={size}>
              <AvatarGroup avatars={clients(4)} size={size} />
            </Group>
          ))}
        </div>
      </Group>
      <Group title="Team/partner entities (entityType: team)" description="A firm, outside counsel, or co-trustee organization - not an individual.">
        <div style={row}>
          {(['xs', 'sm', 'md', 'lg'] as AvatarGroupSize[]).map((size) => (
            <Group key={size} title={size}>
              <AvatarGroup avatars={entities(3)} size={size} />
            </Group>
          ))}
        </div>
      </Group>
    </div>
  ),
};

/** `maxVisible` truncates the rest behind a "+N" trigger that opens a Dropdown Menu holding the remaining truncated people, each with their own name (and picture, when one is set). */
export const Overflow: Story = {
  render: () => (
    <div style={stack}>
      <Group title="8 clients, maxVisible=4">
        <AvatarGroup avatars={clients(8)} maxVisible={4} />
      </Group>
      <Group title="Every size" description="The overflow trigger matches Avatar's own diameter exactly at every size.">
        <div style={row}>
          {(['xs', 'sm', 'md', 'lg'] as AvatarGroupSize[]).map((size) => (
            <AvatarGroup key={size} avatars={clients(8)} maxVisible={4} size={size} />
          ))}
        </div>
      </Group>
    </div>
  ),
};

/** How Avatar Group behaves with realistic content - a task's assignees, a matter's team, mixing individual clients with a team/partner entity. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Task assignees" description="A short, unbounded list - no truncation needed.">
        <AvatarGroup avatars={clients(3)} size="md" />
      </Group>
      <Group title="Matter team" description="Bounded to 5 visible; the rest reachable through the overflow trigger.">
        <AvatarGroup avatars={clients(9)} maxVisible={5} size="md" />
      </Group>
      <Group title="Clients plus an outside firm" description="entityType='team' on the last entry shows the two-person fallback instead of the individual one.">
        <AvatarGroup avatars={[...clients(3), ...entities(1)]} size="md" />
      </Group>
    </div>
  ),
};

/** Selecting a truncated avatar from the overflow panel - Avatar Group never assumes what selection means; it calls `onOverflowAvatarSelect` and leaves navigation to the consumer. */
export const EdgeCases: Story = {
  render: () => {
    function SelectFromOverflowExample() {
      const [lastSelected, setLastSelected] = React.useState<string | null>(null);

      return (
        <div style={stack}>
          <AvatarGroup
            avatars={clients(8)}
            maxVisible={4}
            onOverflowAvatarSelect={(avatar) => setLastSelected(avatar.name ?? avatar.id)}
          />
          <p style={captionStyle}>{lastSelected ? `Selected from overflow: ${lastSelected}` : 'Nothing selected yet.'}</p>
        </div>
      );
    }

    function SingleAvatarExample() {
      return (
        <Group title="A single avatar, well under maxVisible" description="No overflow trigger renders at all - it's optional.">
          <AvatarGroup avatars={clients(1)} maxVisible={4} />
        </Group>
      );
    }

    function InteractiveAvatarsExample() {
      return (
        <Group title="Individually interactive avatars" description="Each visible avatar can still be its own click target - Avatar Group only touches size.">
          <AvatarGroup
            avatars={clients(3).map((avatar) => ({ ...avatar, isInteractive: true, onClick: () => undefined }))}
          />
        </Group>
      );
    }

    function MaxVisibleFloorExample() {
      return (
        <Group
          title="maxVisible below 1 is clamped to 1"
          description="A “+N” trigger with no avatars next to it doesn’t read as a group of people - maxVisible=0 here still shows one avatar (and warns in development)."
        >
          <AvatarGroup avatars={clients(5)} maxVisible={0} />
        </Group>
      );
    }

    return (
      <div style={stack}>
        <Group title="Selecting a truncated avatar" description="Avatar Group calls onOverflowAvatarSelect - it does not navigate or close the panel on its own.">
          <SelectFromOverflowExample />
        </Group>
        <SingleAvatarExample />
        <InteractiveAvatarsExample />
        <MaxVisibleFloorExample />
      </div>
    );
  },
};
