import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterIcon, MoreVertIcon, RoadmapIcon, TaskCompleteIcon, TaskInProgressIcon, TaskNotStartedIcon } from '../../../assets/icons';
import { Avatar } from '../../../components/atoms/avatar';
import { Button } from '../../../components/atoms/button';
import { IconButton } from '../../../components/atoms/icon-button';
import { Label } from '../../../components/atoms/label';
import { ProgressBar } from '../../../components/atoms/progress-bar';
import { Tag } from '../../../components/atoms/tag';
import { Breadcrumbs } from '../../../components/molecules/breadcrumbs';
import { Chip } from '../../../components/molecules/chip';
import { ChipGroup } from '../../../components/molecules/chip-group';
import { IconTile } from '../../../components/molecules/icon-tile';
import { KeyValueList } from '../../../components/molecules/key-value-list';
import { KeyValuePair } from '../../../components/molecules/key-value-pair';
import { Select } from '../../../components/molecules/select';
import { Skeleton } from '../../../components/molecules/skeleton';
import { Card } from '../../../components/organisms/card';
import { DatePicker } from '../../../components/organisms/date-picker';
import { DropdownMenu } from '../../../components/organisms/dropdown-menu';
import { EmptyState } from '../../../components/organisms/empty-state';
import { Table } from '../../../components/organisms/table';
import type { TableColumn } from '../../../components/organisms/table';
import { toast, ToastGroup } from '../../../components/organisms/toast-group';
import styles from './roadmap.module.css';

// Templates / Roadmap: one client's roadmap, built only from system components. A draft, made
// ahead of the designs: the client, the matter, the stages, the tasks, and who does them are
// placeholders, and the page lists each as an open question. The local stylesheet lays the screen
// out and sets the type of its own heading and text; it never restyles a component. The template
// page lists every component imported here as "Components used".

const meta = {
  title: 'Templates/Roadmap',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Placeholder data -------------------------------------------------------------------------

type TaskStatus = 'not-started' | 'in-progress' | 'complete';

interface Task {
  id: string;
  stage: string;
  name: string;
  status: TaskStatus;
  assignee: string;
  due: Date;
}

/** Each status: its words, the Label tone that carries them, and the task icon beside it. */
const STATUS = {
  'not-started': { label: 'Not started', tone: 'default', Icon: TaskNotStartedIcon, color: 'subtle' },
  'in-progress': { label: 'In progress', tone: 'information', Icon: TaskInProgressIcon, color: 'information' },
  complete: { label: 'Complete', tone: 'success', Icon: TaskCompleteIcon, color: 'success' },
} as const;

const STATUSES: TaskStatus[] = ['not-started', 'in-progress', 'complete'];

const STAGES = [
  { id: 'intake', name: 'Intake' },
  { id: 'design', name: 'Plan design' },
  { id: 'drafting', name: 'Drafting' },
  { id: 'signing', name: 'Signing' },
  { id: 'funding', name: 'Funding' },
];

const PEOPLE = ['Elena Ortiz', 'Tomás Reyes', 'Priya Shah', 'Daniel Okafor', 'Grace Okafor'];

const day = (month: number, date: number) => new Date(2026, month - 1, date);

const TASKS: Task[] = [
  { id: 'T-01', stage: 'intake', name: 'Sign the engagement letter', status: 'complete', assignee: 'Daniel Okafor', due: day(9, 8) },
  { id: 'T-02', stage: 'intake', name: 'Return the client questionnaire', status: 'complete', assignee: 'Daniel Okafor', due: day(9, 15) },
  { id: 'T-03', stage: 'intake', name: 'Gather the asset inventory', status: 'complete', assignee: 'Tomás Reyes', due: day(9, 22) },
  { id: 'T-04', stage: 'design', name: 'Hold the design meeting', status: 'complete', assignee: 'Elena Ortiz', due: day(9, 29) },
  { id: 'T-05', stage: 'design', name: 'Approve the plan summary', status: 'complete', assignee: 'Daniel Okafor', due: day(10, 2) },
  { id: 'T-06', stage: 'design', name: 'Name trustees and guardians', status: 'complete', assignee: 'Grace Okafor', due: day(10, 6) },
  { id: 'T-07', stage: 'drafting', name: 'Draft the revocable trust', status: 'complete', assignee: 'Elena Ortiz', due: day(10, 9) },
  { id: 'T-08', stage: 'drafting', name: 'Draft the pour-over wills', status: 'complete', assignee: 'Elena Ortiz', due: day(10, 13) },
  { id: 'T-09', stage: 'drafting', name: 'Draft the powers of attorney', status: 'complete', assignee: 'Tomás Reyes', due: day(10, 16) },
  { id: 'T-10', stage: 'drafting', name: 'Draft the health care directives', status: 'in-progress', assignee: 'Tomás Reyes', due: day(10, 23) },
  { id: 'T-11', stage: 'signing', name: 'Schedule the signing meeting', status: 'in-progress', assignee: 'Priya Shah', due: day(10, 28) },
  { id: 'T-12', stage: 'signing', name: 'Sign and witness the documents', status: 'not-started', assignee: 'Elena Ortiz', due: day(11, 10) },
  { id: 'T-13', stage: 'funding', name: 'Retitle the house to the trust', status: 'not-started', assignee: 'Tomás Reyes', due: day(11, 24) },
  { id: 'T-14', stage: 'funding', name: 'Update beneficiary designations', status: 'not-started', assignee: 'Daniel Okafor', due: day(12, 8) },
];

const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const isComplete = (task: Task) => task.status === 'complete';

const person = (name: string) => <Avatar name={name} size="xs" decorative />;

const ASSIGNEE_OPTIONS = PEOPLE.map((name) => ({ value: name, label: name, icon: person(name) }));

// --- Pieces of the screen ---------------------------------------------------------------------

/** A task's status: the task icon, then the status in words in a Label. */
function StatusCell({ status }: { status: TaskStatus }) {
  const { label, tone, Icon, color } = STATUS[status];
  return (
    <span className={styles.status}>
      <Icon color={color} />
      <Label size="sm" tone={tone}>
        {label}
      </Label>
    </span>
  );
}

/** One task's actions, behind one Icon Button named for the task: its status, as radio rows. */
function TaskActions({ task, onStatusChange }: { task: Task; onStatusChange: (task: Task, status: TaskStatus) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu
      aria-label={`Actions for ${task.name}`}
      open={open}
      onOpenChange={setOpen}
      showSearch={false}
      size="sm"
      alignment="right"
      sections={[
        {
          id: 'status',
          heading: 'Status',
          items: STATUSES.map((status) => {
            const { label, Icon } = STATUS[status];
            return { id: status, label, leadingElement: <Icon />, selectionType: 'radio', selected: task.status === status, onSelect: () => onStatusChange(task, status) };
          }),
        },
      ]}
    >
      <IconButton appearance="subtle" size="sm" isExpanded={open} aria-label={`Actions for ${task.name}`} onClick={() => setOpen((current) => !current)}>
        <MoreVertIcon />
      </IconButton>
    </DropdownMenu>
  );
}

/** A filter chip whose value opens a menu of the values it can take, each with its preview. */
function FilterChip<Value extends string>({
  label,
  value,
  options,
  onChange,
  onRemove,
}: {
  label: string;
  value: Value;
  options: Array<{ value: Value; label: string; preview: React.ReactNode }>;
  onChange: (value: Value) => void;
  onRemove: () => void;
}) {
  const current = options.find((option) => option.value === value);
  return (
    <Chip
      mode="filter"
      label={label}
      valuePreview={current?.preview}
      value={{
        label: current?.label ?? value,
        sections: [
          {
            id: label,
            items: options.map((option) => ({
              id: option.value,
              label: option.label,
              leadingElement: option.preview,
              selectionType: 'radio',
              selected: option.value === value,
              onSelect: () => onChange(option.value),
            })),
          },
        ],
      }}
      onRemove={onRemove}
    />
  );
}

const STATUS_FILTER_OPTIONS = STATUSES.map((status) => {
  const { label, Icon, color } = STATUS[status];
  return { value: status, label, preview: <Icon color={color} /> };
});
const ASSIGNEE_FILTER_OPTIONS = PEOPLE.map((name) => ({ value: name, label: name, preview: person(name) }));

/** The trail, the roadmap's name, its key facts, and its completion. */
function RoadmapHeader({ tasks }: { tasks: Task[] }) {
  const complete = tasks.filter(isComplete).length;
  const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
  const notStarted = tasks.length - complete - inProgress;
  const completionText = tasks.length ? `${complete} of ${count(tasks.length, 'task', 'tasks')} complete` : 'Nothing to complete yet';
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Matters', href: '#matters' },
          { label: 'Okafor estate plan', href: '#matter-M-1047' },
          { label: 'Estate plan roadmap' },
        ]}
      />
      <div className={styles.header}>
        <div className={styles.summary}>
          <div className={styles.titleRow}>
            <IconTile tone="purple" size="md">
              <RoadmapIcon />
            </IconTile>
            <h3 className={styles.title}>Estate plan roadmap</h3>
          </div>
          <KeyValueList>
            <KeyValuePair
              label="Client"
              value={
                <Tag size="sm" tone="blue" href="#person-daniel-okafor">
                  Daniel and Grace Okafor
                </Tag>
              }
              underline
            />
            <KeyValuePair
              label="Matter"
              value={
                <Tag size="sm" tone="teal" href="#matter-M-1047">
                  Okafor estate plan
                </Tag>
              }
              underline
            />
            <KeyValuePair
              label="Owner"
              value={
                <span className={styles.person}>
                  {person('Elena Ortiz')}
                  Elena Ortiz
                </span>
              }
              underline
            />
            <KeyValuePair label="Target date" value="Dec 15, 2026" />
          </KeyValueList>
        </div>
        <Card className={styles.completion}>
          <div className={styles.completionContent}>
            <ProgressBar
              variant="circular"
              value={tasks.length ? (complete / tasks.length) * 100 : 0}
              label="Roadmap completion"
              getValueText={() => completionText}
            />
            <div className={styles.completionText}>
              <p className={styles.count}>{completionText}</p>
              {tasks.length ? (
                <p className={styles.meta}>
                  {inProgress} in progress, {notStarted} not started
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// --- The screen -------------------------------------------------------------------------------

interface RoadmapScreenProps {
  tasks?: Task[];
  status?: TaskStatus | null;
  assignee?: string | null;
}

/**
 * The whole roadmap: the header, the filters, and the tasks in a table per stage. Changing a task's
 * status updates the completion and confirms with a toast; its assignee and due date change in
 * place.
 */
function RoadmapScreen({ tasks: initialTasks = TASKS, status: initialStatus = null, assignee: initialAssignee = null }: RoadmapScreenProps) {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [status, setStatus] = React.useState<TaskStatus | null>(initialStatus);
  const [assignee, setAssignee] = React.useState<string | null>(initialAssignee);
  const [addingFilter, setAddingFilter] = React.useState(false);

  // When the control someone used leaves the page (a task that no longer matches the filters, a
  // removed filter chip, the empty state's button), focus moves to the results line, which says
  // what's shown now. It waits for the render, so the control's own focus handling runs first.
  const resultsRef = React.useRef<HTMLParagraphElement>(null);
  const focusResultsNext = React.useRef(false);
  React.useEffect(() => {
    if (!focusResultsNext.current) return;
    focusResultsNext.current = false;
    resultsRef.current?.focus();
  });

  const matches = (task: Task) => (status == null || task.status === status) && (assignee == null || task.assignee === assignee);
  const shown = tasks.filter(matches);
  const hasFilters = status != null || assignee != null;

  const update = (target: Task, patch: Partial<Task>) => {
    if (!matches({ ...target, ...patch })) focusResultsNext.current = true;
    setTasks((current) => current.map((task) => (task.id === target.id ? { ...task, ...patch } : task)));
  };

  const changeStatus = (target: Task, next: TaskStatus) => {
    if (target.status === next) return;
    update(target, { status: next });
    const done = tasks.filter((task) => (task.id === target.id ? next === 'complete' : isComplete(task))).length;
    const progress = `${done} of ${count(tasks.length, 'task is', 'tasks are')} complete.`;
    if (next === 'complete' && done === tasks.length) toast.success('Roadmap complete', { description: `All ${tasks.length} tasks are complete.` });
    else if (next === 'complete') toast.success('Task complete', { description: `${target.name}. ${progress}` });
    else toast(`Task marked ${STATUS[next].label.toLowerCase()}`, { description: `${target.name}. ${progress}` });
  };

  const removeStatus = () => {
    focusResultsNext.current = true;
    setStatus(null);
  };
  const removeAssignee = () => {
    focusResultsNext.current = true;
    setAssignee(null);
  };
  const clearFilters = () => {
    focusResultsNext.current = true;
    setStatus(null);
    setAssignee(null);
  };

  const columns: Array<TableColumn<Task>> = [
    { key: 'name', header: 'Task', emphasis: 'strong', minWidth: 220 },
    { key: 'status', header: 'Status', width: 168, render: (task) => <StatusCell status={task.status} /> },
    {
      key: 'assignee',
      header: 'Assignee',
      cellAppearance: 'editable',
      width: 208,
      render: (task) => (
        <Select
          aria-label={`Assignee, ${task.name}`}
          options={ASSIGNEE_OPTIONS}
          value={task.assignee}
          onChange={(next) => {
            if (next && next !== task.assignee) update(task, { assignee: next });
          }}
        />
      ),
    },
    {
      key: 'due',
      header: 'Due',
      cellAppearance: 'editable',
      width: 176,
      render: (task) => <DatePicker aria-label={`Due date, ${task.name}`} value={task.due} locale="en-US" format={formatDate} onChange={(due) => update(task, { due })} />,
    },
    {
      key: 'actions',
      header: '',
      headerLabel: 'Actions',
      align: 'end',
      width: 64,
      render: (task) => <TaskActions task={task} onStatusChange={changeStatus} />,
    },
  ];

  const stages = STAGES.filter((stage) => shown.some((task) => task.stage === stage.id));
  const results = hasFilters
    ? `${shown.length} of ${count(tasks.length, 'task matches', 'tasks match')}`
    : `${count(tasks.length, 'task', 'tasks')} in ${count(STAGES.length, 'stage', 'stages')}`;

  return (
    <div className={styles.screen}>
      <RoadmapHeader tasks={tasks} />
      {tasks.length === 0 ? (
        <EmptyState heading="No tasks yet" headingLevel={4} appearance="informative" actions={<Button prominence="primary">Add a task</Button>}>
          Tasks you add to this roadmap appear here, grouped by stage, and count toward its completion.
        </EmptyState>
      ) : (
        <>
          <div className={styles.filterBar}>
            {hasFilters ? (
              <ChipGroup aria-label="Active filters">
                {status != null && <FilterChip<TaskStatus> label="Status" value={status} options={STATUS_FILTER_OPTIONS} onChange={setStatus} onRemove={removeStatus} />}
                {assignee != null && <FilterChip label="Assignee" value={assignee} options={ASSIGNEE_FILTER_OPTIONS} onChange={setAssignee} onRemove={removeAssignee} />}
              </ChipGroup>
            ) : null}
            <DropdownMenu
              aria-label="Add a filter"
              open={addingFilter}
              onOpenChange={setAddingFilter}
              showSearch={false}
              size="sm"
              sections={[
                {
                  id: 'filters',
                  heading: 'Filter by',
                  items: [
                    { id: 'status', label: 'Status', disabled: status != null, onSelect: () => setStatus('not-started') },
                    { id: 'assignee', label: 'Assignee', disabled: assignee != null, onSelect: () => setAssignee(PEOPLE[0]) },
                  ],
                },
              ]}
            >
              <Button size="sm" iconBefore={<FilterIcon />} isExpanded={addingFilter} onClick={() => setAddingFilter((current) => !current)}>
                Add filter
              </Button>
            </DropdownMenu>
            {hasFilters ? (
              <Button size="sm" prominence="tertiary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
            <p ref={resultsRef} className={styles.results} role="status" tabIndex={-1}>
              {results}
            </p>
          </div>
          {stages.length ? (
            <div className={styles.stages}>
              {stages.map((stage) => {
                const inStage = tasks.filter((task) => task.stage === stage.id);
                return (
                  <Table
                    key={stage.id}
                    title={stage.name}
                    headingLevel={4}
                    description={`${inStage.filter(isComplete).length} of ${inStage.length} complete`}
                    columns={columns}
                    data={shown.filter((task) => task.stage === stage.id)}
                    getRowId={(task) => task.id}
                    size="sm"
                    resizableColumns={false}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState heading="No tasks match" headingLevel={4} appearance="informative" actions={<Button onClick={clearFilters}>Clear filters</Button>}>
              Choose another status or assignee, or clear the filters to see every task.
            </EmptyState>
          )}
        </>
      )}
    </div>
  );
}

// --- Loading ----------------------------------------------------------------------------------

const LOADING_COLUMNS: Array<TableColumn<Task>> = [
  { key: 'name', header: 'Task', minWidth: 220 },
  { key: 'status', header: 'Status', width: 168 },
  { key: 'assignee', header: 'Assignee', width: 208 },
  { key: 'due', header: 'Due', width: 176 },
  { key: 'actions', header: '', headerLabel: 'Actions', width: 64 },
];

/** The roadmap's known shape, held by skeletons: one labelled, the rest hidden. */
function RoadmapLoading() {
  return (
    <div className={styles.screen}>
      <Skeleton label="Loading the roadmap" className={styles.skeletonTrail} />
      <div className={styles.header}>
        <div className={styles.summary}>
          <div className={styles.titleRow}>
            <Skeleton className={styles.skeletonTile} />
            <Skeleton className={styles.skeletonTitle} />
          </div>
          <div className={styles.skeletonFacts}>
            {['8rem', '9rem', '7rem', '6rem'].map((width) => (
              <div key={width} className={styles.skeletonFact}>
                <Skeleton className={styles.skeletonKey} />
                <Skeleton style={{ inlineSize: width }} />
              </div>
            ))}
          </div>
        </div>
        <Card className={styles.completion}>
          <div className={styles.completionContent}>
            <Skeleton shape="round" className={styles.skeletonRing} />
            <div className={styles.completionText}>
              <Skeleton className={styles.skeletonCount} />
              <Skeleton className={styles.skeletonMeta} />
            </div>
          </div>
        </Card>
      </div>
      <Table caption="Tasks" columns={LOADING_COLUMNS} data={[]} loading skeletonRowCount={5} size="sm" resizableColumns={false} />
    </div>
  );
}

// --- Stories ----------------------------------------------------------------------------------

/**
 * The whole workflow. Change a task's status from its actions, which updates the completion and
 * confirms with a toast; reassign it or move its due date in place; filter by status or assignee.
 */
export const Roadmap: Story = {
  render: () => (
    <>
      <RoadmapScreen />
      <ToastGroup />
    </>
  ),
};

/** Filters that match no task: an Empty State that says so, with a way to clear them. */
export const NoMatchingTasks: Story = {
  render: () => <RoadmapScreen status="not-started" assignee="Priya Shah" />,
};

/** The roadmap loading into its known shape. */
export const Loading: Story = {
  render: () => <RoadmapLoading />,
};

/** A roadmap with no tasks yet. */
export const NoTasksYet: Story = {
  render: () => <RoadmapScreen tasks={[]} />,
};
