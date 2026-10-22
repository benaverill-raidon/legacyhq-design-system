import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreVertIcon } from '../../../assets/icons';
import { Button } from '../../../components/atoms/button';
import { IconButton } from '../../../components/atoms/icon-button';
import { Label } from '../../../components/atoms/label';
import { Link } from '../../../components/atoms/link';
import { AvatarGroup } from '../../../components/molecules/avatar-group';
import { ButtonGroup } from '../../../components/molecules/button-group';
import { Chip } from '../../../components/molecules/chip';
import { ChipGroup } from '../../../components/molecules/chip-group';
import { Field } from '../../../components/molecules/field';
import { InlineEdit } from '../../../components/molecules/inline-edit';
import { KeyValueList } from '../../../components/molecules/key-value-list';
import { KeyValuePair } from '../../../components/molecules/key-value-pair';
import { Pagination } from '../../../components/molecules/pagination';
import { Select } from '../../../components/molecules/select';
import { TagGroup } from '../../../components/molecules/tag-group';
import { TextField } from '../../../components/molecules/text-field';
import { Card } from '../../../components/organisms/card';
import { DropdownMenu } from '../../../components/organisms/dropdown-menu';
import { EmptyState } from '../../../components/organisms/empty-state';
import { ModalDialog } from '../../../components/organisms/modal-dialog';
import { Table } from '../../../components/organisms/table';
import type { RowId, TableColumn } from '../../../components/organisms/table';
import { toast, ToastGroup } from '../../../components/organisms/toast-group';
import styles from './collections.module.css';

// Examples for Patterns / Collections, built only from system components. The local stylesheet lays
// them out and sets the type of the examples' own headings and text; it never restyles a component.
// The pattern page lists every component imported here as "Components used".

const meta = {
  title: 'Patterns/Collections',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Matters ----------------------------------------------------------------------------------

type MatterStatus = 'Open' | 'Awaiting signature' | 'Closed';

interface Matter {
  id: string;
  name: string;
  client: string;
  attorney: string;
  status: MatterStatus;
  /** The next deadline, as an ISO date, so it sorts in date order. */
  deadline: string;
}

const MATTERS: Matter[] = [
  { id: 'M-1042', name: 'Rivera v. Atlantic Insurance', client: 'Lucia Rivera', attorney: 'Priya Shah', status: 'Open', deadline: '2026-11-03' },
  { id: 'M-1043', name: 'Estate of Harold Chen', client: 'Margaret Chen', attorney: 'Marcus Bell', status: 'Awaiting signature', deadline: '2026-10-28' },
  { id: 'M-1047', name: 'Okafor Family Trust', client: 'Daniel Okafor', attorney: 'Elena Ortiz', status: 'Open', deadline: '2026-12-15' },
  { id: 'M-1051', name: 'Doe Revocable Trust amendment', client: 'Jane Doe', attorney: 'Priya Shah', status: 'Closed', deadline: '2026-09-30' },
  { id: 'M-1053', name: 'Patel guardianship petition', client: 'Anita Patel', attorney: 'Marcus Bell', status: 'Open', deadline: '2026-11-12' },
  { id: 'M-1058', name: 'Estate of Ruth Abrams', client: 'Samuel Abrams', attorney: 'Elena Ortiz', status: 'Awaiting signature', deadline: '2026-10-24' },
  { id: 'M-1060', name: 'Kowalski v. Hudson Bank', client: 'Peter Kowalski', attorney: 'Priya Shah', status: 'Open', deadline: '2026-11-20' },
  { id: 'M-1064', name: 'Nguyen special needs trust', client: 'Linh Nguyen', attorney: 'Marcus Bell', status: 'Open', deadline: '2027-01-08' },
  { id: 'M-1066', name: 'Estate of Walter Brooks', client: 'Diane Brooks', attorney: 'Elena Ortiz', status: 'Closed', deadline: '2026-08-14' },
  { id: 'M-1071', name: 'Alvarez prenuptial agreement', client: 'Sofia Alvarez', attorney: 'Priya Shah', status: 'Awaiting signature', deadline: '2026-10-31' },
  { id: 'M-1075', name: 'Moreau charitable remainder trust', client: 'Claire Moreau', attorney: 'Marcus Bell', status: 'Open', deadline: '2026-12-02' },
  { id: 'M-1079', name: 'Estate of Frank Delgado', client: 'Rosa Delgado', attorney: 'Elena Ortiz', status: 'Open', deadline: '2026-11-07' },
];

const STATUSES: MatterStatus[] = ['Open', 'Awaiting signature', 'Closed'];
const ATTORNEYS = ['Elena Ortiz', 'Marcus Bell', 'Priya Shah'];

const statusTone = { Open: 'information', 'Awaiting signature': 'warning', Closed: 'default' } as const;

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One row's actions, behind one Icon Button named for the row. */
function MatterActions({ matter, onClose, onDelete }: { matter: Matter; onClose: (matter: Matter) => void; onDelete: (matter: Matter) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu
      aria-label={`Actions for ${matter.name}`}
      open={open}
      onOpenChange={setOpen}
      showSearch={false}
      size="sm"
      alignment="end"
      sections={[
        {
          id: 'actions',
          items: [
            { id: 'close', label: 'Close matter', disabled: matter.status === 'Closed', onSelect: () => onClose(matter) },
            { id: 'delete', label: 'Delete matter', onSelect: () => onDelete(matter) },
          ],
        },
      ]}
    >
      <IconButton appearance="subtle" isExpanded={open} aria-label={`Actions for ${matter.name}`} onClick={() => setOpen((current) => !current)}>
        <MoreVertIcon />
      </IconButton>
    </DropdownMenu>
  );
}

/** A filter chip whose value opens a menu of the values it can take. */
function filterChip(label: string, value: string, values: string[], onChange: (value: string) => void, onRemove: () => void) {
  return (
    <Chip
      key={label}
      mode="filter"
      label={label}
      value={{
        label: value,
        sections: [{ id: label, items: values.map((option) => ({ id: option, label: option, selectionType: 'radio', selected: option === value, onSelect: () => onChange(option) })) }],
      }}
      onRemove={onRemove}
    />
  );
}

/** Search, sort, filters, paging, selection with a bulk action, and each row's own actions, on one table. */
export const MattersTable: Story = {
  render: function Render() {
    const [matters, setMatters] = React.useState(MATTERS);
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState<MatterStatus | null>('Open');
    const [attorney, setAttorney] = React.useState<string | null>(null);
    const [addingFilter, setAddingFilter] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);
    const [selected, setSelected] = React.useState<RowId[]>([]);
    const [deleting, setDeleting] = React.useState<Matter[] | null>(null);

    // A new search or filter starts again from the first page.
    const narrow = <T,>(set: (value: T) => void) => (value: T) => {
      set(value);
      setPage(1);
    };
    const changeSearch = narrow(setSearch);
    const changeStatus = narrow(setStatus);
    const changeAttorney = narrow(setAttorney);
    const clearFilters = () => {
      changeStatus(null);
      changeAttorney(null);
    };

    const query = search.trim().toLowerCase();
    const rows = matters.filter(
      (matter) =>
        (!query || matter.name.toLowerCase().includes(query) || matter.client.toLowerCase().includes(query)) &&
        (!status || matter.status === status) &&
        (!attorney || matter.attorney === attorney),
    );
    const hasFilters = status != null || attorney != null;

    const confirmDelete = () => {
      if (!deleting) return;
      const ids = new Set<RowId>(deleting.map((matter) => matter.id));
      setMatters((current) => current.filter((matter) => !ids.has(matter.id)));
      setSelected((current) => current.filter((id) => !ids.has(id)));
      setDeleting(null);
      toast(deleting.length === 1 ? 'Matter deleted' : `${deleting.length} matters deleted`, { description: deleting.map((matter) => matter.name).join(', ') });
    };
    const closeMatter = (target: Matter) => {
      setMatters((current) => current.map((matter) => (matter.id === target.id ? { ...matter, status: 'Closed' } : matter)));
      toast.success('Matter closed', { description: target.name });
    };
    const one = deleting?.length === 1;

    const columns: Array<TableColumn<Matter>> = [
      {
        key: 'name',
        header: 'Matter',
        sortable: true,
        emphasis: 'strong',
        minWidth: 240,
        render: (matter) => (
          <Link href={`#matter-${matter.id}`} emphasis="strong">
            {matter.name}
          </Link>
        ),
      },
      { key: 'client', header: 'Client', sortable: true },
      { key: 'attorney', header: 'Attorney', sortable: true },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (matter) => (
          <Label size="sm" tone={statusTone[matter.status]}>
            {matter.status}
          </Label>
        ),
      },
      { key: 'deadline', header: 'Next deadline', sortable: true, align: 'end', render: (matter) => formatDate(matter.deadline) },
      {
        key: 'actions',
        header: '',
        headerLabel: 'Actions',
        align: 'end',
        resizable: false,
        render: (matter) => <MatterActions matter={matter} onClose={closeMatter} onDelete={(target) => setDeleting([target])} />,
      },
    ];

    return (
      <>
        <Table
          title="Matters"
          headingLevel={3}
          description="Every matter at the firm, open and closed."
          columns={columns}
          data={rows}
          getRowId={(matter) => matter.id}
          searchable
          searchValue={search}
          onSearchChange={changeSearch}
          searchPlaceholder="Search matters or clients"
          toolbarActions={
            <DropdownMenu
              aria-label="Add a filter"
              open={addingFilter}
              onOpenChange={setAddingFilter}
              showSearch={false}
              size="sm"
              alignment="end"
              sections={[
                {
                  id: 'filters',
                  heading: 'Filter by',
                  items: [
                    { id: 'status', label: 'Status', disabled: status != null, onSelect: () => changeStatus('Open') },
                    { id: 'attorney', label: 'Attorney', disabled: attorney != null, onSelect: () => changeAttorney(ATTORNEYS[0]) },
                  ],
                },
              ]}
            >
              <Button isExpanded={addingFilter} onClick={() => setAddingFilter((current) => !current)}>
                Add filter
              </Button>
            </DropdownMenu>
          }
          actions={<Button prominence="primary">New matter</Button>}
          activeFilters={
            hasFilters ? (
              <ChipGroup aria-label="Active filters">
                {status != null && filterChip('Status', status, STATUSES, (value) => changeStatus(value as MatterStatus), () => changeStatus(null))}
                {attorney != null && filterChip('Attorney', attorney, ATTORNEYS, changeAttorney, () => changeAttorney(null))}
              </ChipGroup>
            ) : undefined
          }
          onClearFilters={hasFilters ? clearFilters : undefined}
          defaultSort={{ columnKey: 'deadline', direction: 'asc' }}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          getSelectionLabel={(matter) => `Select ${matter.name}`}
          bulkActions={
            <>
              <Button prominence="tertiary" size="sm" onClick={() => setSelected([])}>
                Clear selection
              </Button>
              <Button prominence="secondary" tone="error" size="sm" onClick={() => setDeleting(matters.filter((matter) => selected.includes(matter.id)))}>
                Delete
              </Button>
            </>
          }
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          itemsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          getRangeLabel={(start, end, total) => `${start}–${end} of ${count(total, 'matter', 'matters')}`}
          empty={
            <EmptyState
              heading="No matters match"
              headingLevel={3}
              actions={
                <Button
                  onClick={() => {
                    changeSearch('');
                    clearFilters();
                  }}
                >
                  Clear search and filters
                </Button>
              }
            >
              Try another name, or remove a filter.
            </EmptyState>
          }
        />
        <ModalDialog
          open={deleting != null}
          onClose={() => setDeleting(null)}
          tone="error"
          title={one ? 'Delete this matter?' : `Delete ${deleting?.length ?? 0} matters?`}
          footer={
            <ButtonGroup>
              <Button prominence="tertiary" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button prominence="primary" tone="error" onClick={confirmDelete}>
                {one ? 'Delete matter' : `Delete ${deleting?.length ?? 0} matters`}
              </Button>
            </ButtonGroup>
          }
        >
          {one
            ? `This deletes ${deleting?.[0]?.name}, its documents, and its history.`
            : 'This deletes the selected matters, their documents, and their history.'}{' '}
          You can&apos;t undo it.
        </ModalDialog>
        <ToastGroup />
      </>
    );
  },
};

// --- Filings ----------------------------------------------------------------------------------

interface Filing {
  id: number;
  name: string;
  court: string;
  status: string;
  due: string;
}

const FILING_STATUSES = ['Drafting', 'In review', 'Ready to file', 'Filed'].map((value) => ({ value, label: value }));

/** Two editable columns: a name corrected with Inline Edit, and a status chosen with Select. */
export const EditInPlace: Story = {
  render: function Render() {
    const [filings, setFilings] = React.useState<Filing[]>([
      { id: 1, name: 'Petition for probate', court: 'Bergen County Surrogate', status: 'In review', due: '2026-10-28' },
      { id: 2, name: 'Inventory of assets', court: 'Bergen County Surrogate', status: 'Drafting', due: '2026-11-18' },
      { id: 3, name: 'Motion to compel discovery', court: 'Superior Court of New Jersey', status: 'Ready to file', due: '2026-11-03' },
    ]);
    const update = (id: number, patch: Partial<Filing>) => setFilings((current) => current.map((filing) => (filing.id === id ? { ...filing, ...patch } : filing)));
    const columns: Array<TableColumn<Filing>> = [
      {
        key: 'name',
        header: 'Filing',
        cellAppearance: 'editable',
        width: 280,
        render: (filing) => (
          <InlineEdit value={filing.name} onConfirm={(name) => update(filing.id, { name })}>
            <TextField aria-label={`Filing name, ${filing.name}`} />
          </InlineEdit>
        ),
      },
      { key: 'court', header: 'Court' },
      {
        key: 'status',
        header: 'Status',
        cellAppearance: 'editable',
        width: 200,
        render: (filing) => (
          <Select
            aria-label={`Status, ${filing.name}`}
            options={FILING_STATUSES}
            value={filing.status}
            onChange={(next) => update(filing.id, { status: next ?? filing.status })}
          />
        ),
      },
      { key: 'due', header: 'Due', align: 'end', render: (filing) => formatDate(filing.due) },
    ];
    return <Table title="Filings" headingLevel={3} columns={columns} data={filings} getRowId={(filing) => filing.id} size="sm" />;
  },
};

// --- Documents --------------------------------------------------------------------------------

interface DocumentRecord {
  id: string;
  name: string;
  matter: string;
  uploaded: string;
  status: 'Signed' | 'Needs signature' | 'Draft';
  related: string[];
  people: string[];
}

const DOCUMENTS: DocumentRecord[] = [
  { id: 'D-201', name: 'Last will and testament', matter: 'Estate of Harold Chen', uploaded: 'Oct 12, 2026', status: 'Needs signature', related: ['Estate of Harold Chen', 'Margaret Chen'], people: ['Marcus Bell', 'Margaret Chen'] },
  { id: 'D-202', name: 'Engagement letter', matter: 'Rivera v. Atlantic Insurance', uploaded: 'Oct 9, 2026', status: 'Signed', related: ['Rivera v. Atlantic Insurance', 'Lucia Rivera'], people: ['Priya Shah', 'Lucia Rivera'] },
  { id: 'D-203', name: 'Trust agreement', matter: 'Okafor Family Trust', uploaded: 'Oct 7, 2026', status: 'Draft', related: ['Okafor Family Trust', 'Daniel Okafor', 'Grace Okafor', 'Schedule A'], people: ['Elena Ortiz', 'Daniel Okafor', 'Grace Okafor', 'Tomás Reyes', 'Priya Shah'] },
  { id: 'D-204', name: 'Power of attorney', matter: 'Estate of Harold Chen', uploaded: 'Oct 5, 2026', status: 'Signed', related: ['Estate of Harold Chen', 'Margaret Chen'], people: ['Marcus Bell'] },
  { id: 'D-205', name: 'Complaint', matter: 'Rivera v. Atlantic Insurance', uploaded: 'Sep 29, 2026', status: 'Signed', related: ['Rivera v. Atlantic Insurance', 'Superior Court of New Jersey'], people: ['Priya Shah', 'Marcus Bell'] },
  { id: 'D-206', name: 'Certificate of trust', matter: 'Okafor Family Trust', uploaded: 'Sep 24, 2026', status: 'Needs signature', related: ['Okafor Family Trust', 'Daniel Okafor'], people: ['Elena Ortiz', 'Daniel Okafor'] },
  { id: 'D-207', name: 'Health care directive', matter: 'Estate of Harold Chen', uploaded: 'Sep 18, 2026', status: 'Draft', related: ['Estate of Harold Chen'], people: ['Marcus Bell', 'Margaret Chen'] },
];

const documentTone = { Signed: 'success', 'Needs signature': 'warning', Draft: 'default' } as const;
const ALL_MATTERS = 'all';
const DOCUMENTS_PER_PAGE = 3;

/** Documents as cards, narrowed by one Select and paged with Pagination. */
export const DocumentCards: Story = {
  render: function Render() {
    const [matter, setMatter] = React.useState<string>(ALL_MATTERS);
    const [page, setPage] = React.useState(1);
    const matters = [...new Set(DOCUMENTS.map((item) => item.matter))];
    const documents = DOCUMENTS.filter((item) => matter === ALL_MATTERS || item.matter === matter);
    const totalPages = Math.ceil(documents.length / DOCUMENTS_PER_PAGE);
    const shown = documents.slice((page - 1) * DOCUMENTS_PER_PAGE, page * DOCUMENTS_PER_PAGE);
    return (
      <section className={styles.collection} aria-labelledby="documents-heading">
        <div className={styles.collectionHeader}>
          <h3 id="documents-heading" className={styles.heading}>
            Documents
          </h3>
          <div className={styles.filter}>
            <Field label="Matter">
              <Select
                options={[{ value: ALL_MATTERS, label: 'All matters' }, ...matters.map((value) => ({ value, label: value }))]}
                value={matter}
                onChange={(next) => {
                  setMatter(next ?? ALL_MATTERS);
                  setPage(1);
                }}
              />
            </Field>
          </div>
        </div>
        <ul className={styles.grid}>
          {shown.map((item) => (
            <li key={item.id}>
              <Card className={styles.card}>
                <article className={styles.cardContent} aria-labelledby={`${item.id}-title`}>
                  <div className={styles.cardTop}>
                    <h4 id={`${item.id}-title`} className={styles.cardTitle}>
                      <Link href={`#item-${item.id}`} emphasis="strong">
                        {item.name}
                      </Link>
                    </h4>
                    <Label size="sm" tone={documentTone[item.status]}>
                      {item.status}
                    </Label>
                  </div>
                  <p className={styles.meta}>Uploaded {item.uploaded}</p>
                  <TagGroup tags={item.related.map((label) => ({ id: label, label, href: `#record-${label}` }))} maxVisible={2} />
                  <AvatarGroup avatars={item.people.map((name) => ({ id: name, name }))} maxVisible={3} size="sm" />
                </article>
              </Card>
            </li>
          ))}
        </ul>
        {totalPages > 1 && <Pagination aria-label="Documents pagination" currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
      </section>
    );
  },
};

// --- One matter -------------------------------------------------------------------------------

/** One matter's details: a Key Value List, with its people and linked records as groups. */
export const MatterDetails: Story = {
  render: function Render() {
    const [attorney, setAttorney] = React.useState('Priya Shah');
    return (
      <Card className={styles.details}>
        <section className={styles.cardContent} aria-labelledby="matter-details-heading">
          <h3 id="matter-details-heading" className={styles.heading}>
            Rivera v. Atlantic Insurance
          </h3>
          <KeyValueList>
            <KeyValuePair label="Client" value="Lucia Rivera" underline />
            <KeyValuePair label="Case number" value="2026-CV-01482" underline />
            <KeyValuePair label="Court" value="Superior Court of New Jersey" underline />
            <KeyValuePair
              label="Status"
              value={
                <Label size="sm" tone="information">
                  Open
                </Label>
              }
              underline
            />
            <KeyValuePair label="Responsible attorney" underline>
              <InlineEdit value={attorney} onConfirm={setAttorney} actionPlacement="end">
                <TextField context="inline" aria-label="Responsible attorney" />
              </InlineEdit>
            </KeyValuePair>
            <KeyValuePair label="Team" value={<AvatarGroup avatars={['Priya Shah', 'Marcus Bell', 'Tomás Reyes', 'Elena Ortiz', 'Jordan Ellis'].map((name) => ({ id: name, name }))} maxVisible={3} size="sm" />} underline />
            <KeyValuePair
              label="Linked records"
              value={
                <TagGroup
                  tags={['Lucia Rivera', 'Atlantic Insurance claim 88-2041', 'Engagement letter', 'Complaint', 'Discovery requests'].map((label) => ({ id: label, label, href: `#record-${label}` }))}
                  maxVisible={2}
                />
              }
            />
          </KeyValueList>
        </section>
      </Card>
    );
  },
};
