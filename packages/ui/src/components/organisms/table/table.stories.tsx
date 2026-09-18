import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../atoms/avatar';
import { Badge } from '../../atoms/badge';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { Label } from '../../atoms/label';
import { Link } from '../../atoms/link';
import { ProgressBar } from '../../atoms/progress-bar';
import { Switch } from '../../atoms/switch';
import { Tag } from '../../atoms/tag';
import { EditIcon, FilterIcon, MoreVertIcon, SettingsIcon } from '../../../assets/icons';
import { Chip } from '../../molecules/chip';
import { TextField } from '../../molecules/text-field';
import { Table } from './table';
import type { TableColumn } from './table.types';

/* ---------- Shared member data ---------- */

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Suspended';
  department: string;
  joined: string;
  completion: number;
  active: boolean;
}

const members: Member[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@rtnj.org', role: 'Owner', status: 'Active', department: 'Engineering', joined: '2023-01-04', completion: 100, active: true },
  { id: 2, name: 'Alan Turing', email: 'alan@rtnj.org', role: 'Admin', status: 'Active', department: 'Engineering', joined: '2023-02-11', completion: 88, active: true },
  { id: 3, name: 'Grace Hopper', email: 'grace@rtnj.org', role: 'Admin', status: 'Active', department: 'Operations', joined: '2023-03-19', completion: 95, active: true },
  { id: 4, name: 'Katherine Johnson', email: 'katherine@rtnj.org', role: 'Editor', status: 'Invited', department: 'Research', joined: '2023-05-02', completion: 45, active: false },
  { id: 5, name: 'Edsger Dijkstra', email: 'edsger@rtnj.org', role: 'Editor', status: 'Active', department: 'Engineering', joined: '2023-06-21', completion: 72, active: true },
  { id: 6, name: 'Barbara Liskov', email: 'barbara@rtnj.org', role: 'Editor', status: 'Active', department: 'Engineering', joined: '2023-07-30', completion: 60, active: true },
  { id: 7, name: 'Donald Knuth', email: 'donald@rtnj.org', role: 'Viewer', status: 'Suspended', department: 'Research', joined: '2023-08-14', completion: 33, active: false },
  { id: 8, name: 'Margaret Hamilton', email: 'margaret@rtnj.org', role: 'Viewer', status: 'Active', department: 'Operations', joined: '2023-09-09', completion: 82, active: true },
  { id: 9, name: 'Tim Berners-Lee', email: 'tim@rtnj.org', role: 'Viewer', status: 'Invited', department: 'Engineering', joined: '2023-10-25', completion: 20, active: false },
  { id: 10, name: 'Linus Torvalds', email: 'linus@rtnj.org', role: 'Viewer', status: 'Active', department: 'Engineering', joined: '2023-11-17', completion: 91, active: true },
  { id: 11, name: 'Radia Perlman', email: 'radia@rtnj.org', role: 'Editor', status: 'Active', department: 'Operations', joined: '2024-01-06', completion: 55, active: true },
  { id: 12, name: 'Vint Cerf', email: 'vint@rtnj.org', role: 'Admin', status: 'Active', department: 'Research', joined: '2024-02-28', completion: 78, active: true },
];

const basicColumns: Array<TableColumn<Member>> = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (m) => m.name,
    emphasis: 'strong',
    render: (m) => (
      <Link href={`/members/${m.id}`} emphasis="strong">
        {m.name}
      </Link>
    ),
  },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'joined', header: 'Joined', sortable: true, align: 'end' },
];

const getRowId = (member: Member) => member.id;

/* ---------- Meta ---------- */

const meta: Meta<typeof Table<Member>> = {
  title: 'UI/Organisms/Table',
  component: Table<Member>,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--spacing-2xl)', maxWidth: 1024 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Table<Member>>;

/* ---------- Basic stories ---------- */

export const Basic: Story = {
  render: () => <Table columns={basicColumns} data={members} getRowId={getRowId} caption="Team members" />,
};

export const Sortable: Story = {
  render: () => (
    <Table columns={basicColumns} data={members} getRowId={getRowId} caption="Team members" defaultSort={{ columnKey: 'name', direction: 'asc' }} />
  ),
};

export const Selectable: Story = {
  render: function SelectableStory() {
    const [selected, setSelected] = useState<Array<string | number>>([2, 3]);
    return (
      <Table
        columns={basicColumns}
        data={members}
        getRowId={getRowId}
        caption="Team members"
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        getSelectionLabel={(m) => `Select ${m.name}`}
      />
    );
  },
};

export const Pagination: Story = {
  render: function PaginationStory() {
    const [currentPageSize, setCurrentPageSize] = useState(5);
    return (
      <Table
        columns={basicColumns}
        data={members}
        getRowId={getRowId}
        caption="Team members"
        pageSize={currentPageSize}
        itemsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={setCurrentPageSize}
      />
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-3xl)' }}>
      <Table columns={basicColumns} data={members.slice(0, 4)} getRowId={getRowId} caption="Medium" title="MD" />
      <Table columns={basicColumns} data={members.slice(0, 4)} getRowId={getRowId} caption="Small" title="SM" size="sm" />
    </div>
  ),
};

/* ---------- Toolbar with rich filters ---------- */

const ROLE_OPTIONS = ['Owner', 'Admin', 'Editor', 'Viewer'];
const STATUS_OPTIONS: Array<'Active' | 'Invited' | 'Suspended'> = ['Active', 'Invited', 'Suspended'];
const DEPARTMENT_OPTIONS = ['Engineering', 'Operations', 'Research'];

export const WithToolbar: Story = {
  render: function ToolbarStory() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>('Admin');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [deptFilter, setDeptFilter] = useState<string | null>('Engineering');

    const filtered = useMemo(
      () =>
        members.filter(
          (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) &&
            (!roleFilter || m.role === roleFilter) &&
            (!statusFilter || m.status === statusFilter) &&
            (!deptFilter || m.department === deptFilter),
        ),
      [search, roleFilter, statusFilter, deptFilter],
    );

    const hasFilters = roleFilter != null || statusFilter != null || deptFilter != null;

    return (
      <Table
        columns={basicColumns}
        data={filtered}
        getRowId={getRowId}
        caption="Team members"
        title="Members"
        description="Everyone with access to this workspace."
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members"
        toolbarActions={
          <>
            <IconButton appearance="subtle" aria-label="Filter">
              <FilterIcon />
            </IconButton>
            <IconButton appearance="subtle" aria-label="Settings">
              <SettingsIcon />
            </IconButton>
          </>
        }
        activeFilters={
          hasFilters ? (
            <>
              {roleFilter != null ? (
                <Chip
                  mode="filter"
                  label="Role"
                  value={{
                    label: roleFilter,
                    tooltip: `Showing members with role "${roleFilter}"`,
                    sections: [{ id: 'roles', items: ROLE_OPTIONS.map((r) => ({ id: r, label: r, onAction: () => setRoleFilter(r) })) }],
                  }}
                  onRemove={() => setRoleFilter(null)}
                />
              ) : null}
              {statusFilter != null ? (
                <Chip
                  mode="filter"
                  label="Status"
                  value={{
                    label: statusFilter,
                    tooltip: `Filtering by status "${statusFilter}"`,
                    sections: [{ id: 'statuses', items: STATUS_OPTIONS.map((s) => ({ id: s, label: s, onAction: () => setStatusFilter(s) })) }],
                  }}
                  onRemove={() => setStatusFilter(null)}
                />
              ) : null}
              {deptFilter != null ? (
                <Chip
                  mode="filter"
                  label="Department"
                  value={{
                    label: deptFilter,
                    tooltip: `Department is "${deptFilter}"`,
                    sections: [{ id: 'depts', items: DEPARTMENT_OPTIONS.map((d) => ({ id: d, label: d, onAction: () => setDeptFilter(d) })) }],
                  }}
                  onRemove={() => setDeptFilter(null)}
                />
              ) : null}
            </>
          ) : undefined
        }
        onClearFilters={hasFilters ? () => { setRoleFilter(null); setStatusFilter(null); setDeptFilter(null); } : undefined}
      />
    );
  },
};

/* ---------- Loading / Empty ---------- */

export const Loading: Story = {
  render: () => <Table columns={basicColumns} data={[]} getRowId={getRowId} caption="Team members" loading skeletonRowCount={5} />,
};

export const EmptyStateStory: Story = {
  name: 'Empty',
  render: () => <Table columns={basicColumns} data={[]} getRowId={getRowId} caption="Team members" />,
};

/* ---------- Full Shell (header + toolbar + selection + pagination) ---------- */

export const FullShell: Story = {
  render: function FullShellStory() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Array<string | number>>([]);
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [deptFilter, setDeptFilter] = useState<string | null>(null);
    const [currentPageSize, setCurrentPageSize] = useState(6);

    const filtered = useMemo(
      () =>
        members.filter(
          (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) &&
            (!roleFilter || m.role === roleFilter) &&
            (!statusFilter || m.status === statusFilter) &&
            (!deptFilter || m.department === deptFilter),
        ),
      [search, roleFilter, statusFilter, deptFilter],
    );

    const hasFilters = roleFilter != null || statusFilter != null || deptFilter != null;

    return (
      <Table
        columns={basicColumns}
        data={filtered}
        getRowId={getRowId}
        title="All members"
        description="Everyone with access to the LegacyHQ workspace."
        actions={
          <Button prominence="primary">Invite member</Button>
        }
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members"
        toolbarActions={
          <>
            <IconButton appearance="subtle" aria-label="Filter">
              <FilterIcon />
            </IconButton>
            <IconButton appearance="subtle" aria-label="Settings">
              <SettingsIcon />
            </IconButton>
          </>
        }
        activeFilters={
          hasFilters ? (
            <>
              {roleFilter != null ? (
                <Chip
                  mode="filter"
                  label="Role"
                  value={{
                    label: roleFilter,
                    tooltip: `Role is "${roleFilter}"`,
                    sections: [{ id: 'roles', items: ROLE_OPTIONS.map((r) => ({ id: r, label: r, onAction: () => setRoleFilter(r) })) }],
                  }}
                  onRemove={() => setRoleFilter(null)}
                />
              ) : null}
              {statusFilter != null ? (
                <Chip
                  mode="filter"
                  label="Status"
                  value={{
                    label: statusFilter,
                    tooltip: `Status is "${statusFilter}"`,
                    sections: [{ id: 'statuses', items: STATUS_OPTIONS.map((s) => ({ id: s, label: s, onAction: () => setStatusFilter(s) })) }],
                  }}
                  onRemove={() => setStatusFilter(null)}
                />
              ) : null}
              {deptFilter != null ? (
                <Chip
                  mode="filter"
                  label="Department"
                  value={{
                    label: deptFilter,
                    tooltip: `Department is "${deptFilter}"`,
                    sections: [{ id: 'depts', items: DEPARTMENT_OPTIONS.map((d) => ({ id: d, label: d, onAction: () => setDeptFilter(d) })) }],
                  }}
                  onRemove={() => setDeptFilter(null)}
                />
              ) : null}
            </>
          ) : undefined
        }
        onClearFilters={hasFilters ? () => { setRoleFilter(null); setStatusFilter(null); setDeptFilter(null); } : undefined}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        getSelectionLabel={(m) => `Select ${m.name}`}
        bulkActions={
          <>
            <Button prominence="tertiary" size="sm" onClick={() => setSelected([])}>
              Clear
            </Button>
            <Button prominence="primary" tone="error" size="sm">
              Remove
            </Button>
          </>
        }
        defaultSort={{ columnKey: 'name', direction: 'asc' }}
        pageSize={currentPageSize}
        itemsPerPageOptions={[6, 10, 25]}
        onPageSizeChange={setCurrentPageSize}
      />
    );
  },
};

/* ---------- Cell Variants: all content types at both sizes ---------- */

const statusTone = (s: string) => {
  if (s === 'Active') return 'success' as const;
  if (s === 'Invited') return 'brand' as const;
  return 'error' as const;
};

function cellVariantColumns(tableSize: 'md' | 'sm'): Array<TableColumn<Member>> {
  const avatarSize = tableSize === 'md' ? 'sm' as const : 'xs' as const;
  const labelSize = tableSize === 'md' ? 'md' : 'sm';
  const tagSize = tableSize === 'md' ? 'md' : 'sm';
  const progressSize = tableSize === 'md' ? 'md' : 'md';
  const switchSize = tableSize === 'md' ? 'md' : 'sm';
  const buttonSize = tableSize === 'md' ? 'md' : 'sm';

  return [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (m) => m.name,
      emphasis: 'strong',
      render: (m) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <Avatar name={m.name} size={avatarSize} />
          <Link href={`/members/${m.id}`} emphasis="strong">
            {m.name}
          </Link>
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (m) => m.email,
    },
    {
      key: 'role',
      header: 'Role',
      render: (m) => <Tag size={tagSize}>{m.role}</Tag>,
    },
    {
      key: 'department',
      header: 'Department',
      render: (m) => <Label size={labelSize}>{m.department}</Label>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <Badge tone={statusTone(m.status)}>{m.status}</Badge>,
    },
    {
      key: 'completion',
      header: 'Completion',
      render: (m) => <ProgressBar value={m.completion} size={progressSize} aria-label={`${m.completion}% complete`} />,
      width: 120,
    },
    {
      key: 'active',
      header: 'Active',
      render: (m) => <Switch checked={m.active} size={switchSize} aria-label={`${m.name} active`} />,
      width: 80,
      align: 'center',
    },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <Button prominence="tertiary" size={buttonSize}>Edit</Button>
          <IconButton appearance="subtle" size={buttonSize} aria-label={`More actions for ${m.name}`}>
            <MoreVertIcon />
          </IconButton>
        </div>
      ),
      align: 'end',
      width: 140,
    },
  ];
}

export const CellVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-3xl)' }}>
      <Table
        columns={cellVariantColumns('md')}
        data={members.slice(0, 5)}
        getRowId={getRowId}
        title="Cell variants — MD"
        description="Avatar + Link, text, Label, Tag, Badge, Progress Bar, Switch, Button + IconButton."
        selectable
        defaultSort={{ columnKey: 'name', direction: 'asc' }}
      />
      <Table
        columns={cellVariantColumns('sm')}
        data={members.slice(0, 5)}
        getRowId={getRowId}
        title="Cell variants — SM"
        description="Same columns at SM density with appropriately sized variants."
        size="sm"
        selectable
        defaultSort={{ columnKey: 'name', direction: 'asc' }}
      />
    </div>
  ),
};

/* ---------- Editable Cells: inline TextFields with edit icon ---------- */

export const EditableCells: Story = {
  render: function EditableCellsStory() {
    const [rows, setRows] = useState(() =>
      members.slice(0, 5).map((m) => ({ ...m })),
    );

    const updateField = (id: number, field: keyof Member, value: string) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const editableColumns: Array<TableColumn<Member>> = [
      {
        key: 'name',
        header: 'Name',
        emphasis: 'strong',
        render: (m) => (
          <TextField
            size="sm"
            appearance="inline"
            value={m.name}
            iconAfter={<EditIcon size="sm" decorative />}
            onChange={(e) => updateField(m.id, 'name', e.currentTarget.value)}
            aria-label="Name"
          />
        ),
      },
      {
        key: 'email',
        header: 'Email',
        render: (m) => (
          <TextField
            size="sm"
            appearance="inline"
            value={m.email}
            iconAfter={<EditIcon size="sm" decorative />}
            onChange={(e) => updateField(m.id, 'email', e.currentTarget.value)}
            aria-label="Email"
          />
        ),
      },
      {
        key: 'role',
        header: 'Role',
        render: (m) => (
          <TextField
            size="sm"
            appearance="inline"
            value={m.role}
            iconAfter={<EditIcon size="sm" decorative />}
            onChange={(e) => updateField(m.id, 'role', e.currentTarget.value)}
            aria-label="Role"
          />
        ),
      },
      { key: 'status', header: 'Status' },
      { key: 'joined', header: 'Joined', align: 'end' },
    ];

    return (
      <Table
        columns={editableColumns}
        data={rows}
        getRowId={getRowId}
        title="Editable cells"
        description="Inline TextFields with an edit icon indicate editable fields."
        caption="Editable members"
      />
    );
  },
};
