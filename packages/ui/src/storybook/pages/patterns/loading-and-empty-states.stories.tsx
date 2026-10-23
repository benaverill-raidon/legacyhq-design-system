import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../../components/atoms/button';
import { ProgressBar } from '../../../components/atoms/progress-bar';
import { Spinner } from '../../../components/atoms/spinner';
import { Field } from '../../../components/molecules/field';
import { InlineMessage } from '../../../components/molecules/inline-message';
import { KeyValueList } from '../../../components/molecules/key-value-list';
import { KeyValuePair } from '../../../components/molecules/key-value-pair';
import { Skeleton } from '../../../components/molecules/skeleton';
import { TextField } from '../../../components/molecules/text-field';
import { Card } from '../../../components/organisms/card';
import { EmptyState } from '../../../components/organisms/empty-state';
import { Form, FormFooter, FormRow, FormSection } from '../../../components/organisms/form';
import { SectionMessage } from '../../../components/organisms/section-message';
import { Table } from '../../../components/organisms/table';
import type { TableColumn } from '../../../components/organisms/table';
import { toast } from '../../../components/organisms/toast-group';
import styles from './loading-and-empty-states.module.css';

// Examples for Patterns / Loading and Empty States, built only from system components. The local
// stylesheet lays them out, sizes the skeletons to the content they stand in for, and sets the
// plain status text beside a Spinner or Progress Bar; it never restyles a component. The pattern
// page lists every component imported here as "Components used".

const meta = {
  title: 'Patterns/Loading and Empty States',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Starts loading at once, and again on `reload`; `settle` (declared outside the story, so it's
 * stable) decides what each attempt ends in.
 */
function useLoad<Outcome>(settle: (attempt: number) => Outcome, delay = 1500) {
  const [state, setState] = React.useState<{ loading: boolean; outcome?: Outcome }>({ loading: true });
  const attempt = React.useRef(0);
  const timer = React.useRef<number | undefined>(undefined);
  // Settles the attempt that's running after `delay`. The state starts out loading, so the first
  // attempt only needs the timer; `reload` marks it loading again first.
  const settleLater = React.useCallback(() => {
    window.clearTimeout(timer.current);
    // Counted when it settles, so an attempt that's cancelled doesn't count.
    timer.current = window.setTimeout(() => setState({ loading: false, outcome: settle((attempt.current += 1)) }), delay);
  }, [settle, delay]);
  const reload = React.useCallback(() => {
    setState((current) => ({ ...current, loading: true }));
    settleLater();
  }, [settleLater]);
  React.useEffect(() => {
    settleLater();
    return () => window.clearTimeout(timer.current);
  }, [settleLater]);
  return { ...state, reload };
}

const alwaysLoads = () => 'loaded' as const;
/** The first attempt fails, the next loads, and so on, so the failure can be seen again. */
const failsEveryOtherTime = (attempt: number) => (attempt % 2 === 1 ? 'failed' : 'loaded');

// --- Content whose shape is known -------------------------------------------------------------

const summary = [
  { label: 'Matter', value: 'Rivera v. Atlantic Insurance', width: '14rem' },
  { label: 'Client', value: 'Elena Rivera', width: '7rem' },
  { label: 'Court', value: 'Superior Court of New Jersey, Law Division', width: '18rem' },
  { label: 'Case number', value: '2026-CV-01482', width: '8rem' },
  { label: 'Next deadline', value: 'Answer due November 6, 2026', width: '12rem' },
];

/** The matter summary loads into a layout that's already known, so skeletons hold its shape. */
export const SkeletonThenContent: Story = {
  render: function Render() {
    const { loading, reload } = useLoad(alwaysLoads);
    return (
      <Card className={styles.panel}>
        <div className={styles.toolbar}>
          <Button size="sm" prominence="tertiary" onClick={reload}>
            Refresh
          </Button>
        </div>
        {loading ? (
          <div className={styles.skeletonList}>
            {summary.map(({ label, width }, index) => (
              <div key={label} className={styles.skeletonRow}>
                <Skeleton className={styles.skeletonKey} label={index === 0 ? 'Loading the matter summary' : undefined} />
                <Skeleton style={{ inlineSize: width }} />
              </div>
            ))}
          </div>
        ) : (
          <KeyValueList>
            {summary.map(({ label, value }, index) => (
              <KeyValuePair key={label} label={label} value={value} underline={index < summary.length - 1} />
            ))}
          </KeyValueList>
        )}
      </Card>
    );
  },
};

// --- A busy control, and work in the background ----------------------------------------------

/** The button that started the save is busy until it's done; the document package runs in a toast. */
export const BusyControls: Story = {
  render: function Render() {
    const [saving, setSaving] = React.useState(false);
    const save = (event: React.FormEvent) => {
      event.preventDefault();
      if (saving) return;
      setSaving(true);
      window.setTimeout(() => {
        setSaving(false);
        toast.success('Changes saved');
      }, 1500);
    };
    const generate = () => {
      const id = toast.loading('Generating the document package for Rivera v. Atlantic Insurance…');
      window.setTimeout(() => toast.success('Document package ready', { id, description: '12 documents, ready to review and send.' }), 3000);
    };
    return (
      <>
        <Form title="Matter details" onSubmit={save}>
          <FormSection>
            <FormRow>
              <Field label="Matter name">
                <TextField defaultValue="Rivera v. Atlantic Insurance" />
              </Field>
              <Field label="Case number">
                <TextField defaultValue="2026-CV-01482" />
              </Field>
            </FormRow>
          </FormSection>
          <FormFooter>
            <Button onClick={generate}>Generate document package</Button>
            <Button type="submit" prominence="primary" isLoading={saving}>
              Save changes
            </Button>
          </FormFooter>
        </Form>
      </>
    );
  },
};

// --- Work with a known amount, then a wait with none ------------------------------------------

const UPLOAD_COUNT = 5;

/** An upload counts its files on a Progress Bar; the signature check after it can't be measured. */
export const UploadProgress: Story = {
  render: function Render() {
    const [phase, setPhase] = React.useState<'idle' | 'uploading' | 'checking' | 'done'>('idle');
    const [uploaded, setUploaded] = React.useState(0);
    const timer = React.useRef<number | undefined>(undefined);
    React.useEffect(() => () => window.clearTimeout(timer.current), []);
    const step = (count: number) => {
      setUploaded(count);
      if (count < UPLOAD_COUNT) {
        timer.current = window.setTimeout(() => step(count + 1), 700);
        return;
      }
      setPhase('checking');
      timer.current = window.setTimeout(() => setPhase('done'), 1800);
    };
    const start = () => {
      setPhase('uploading');
      step(0);
    };
    const uploadedText = `${uploaded} of ${UPLOAD_COUNT} documents uploaded`;
    return (
      <Card className={styles.panel}>
        {phase === 'idle' ? (
          <div>
            <Button prominence="primary" onClick={start}>
              Upload 5 documents
            </Button>
          </div>
        ) : null}
        {phase === 'uploading' ? (
          <div className={styles.progress}>
            <ProgressBar value={(uploaded / UPLOAD_COUNT) * 100} label="Uploading documents to Rivera v. Atlantic Insurance" getValueText={() => uploadedText} />
            <p className={styles.status}>{uploadedText}</p>
          </div>
        ) : null}
        {phase === 'checking' ? (
          <p className={styles.status}>
            <Spinner size="sm" />
            Checking the documents for signatures
          </p>
        ) : null}
        {phase === 'done' ? (
          <div className={styles.result}>
            <InlineMessage tone="success" title="5 documents uploaded" secondaryText="All signed" />
            <Button size="sm" prominence="tertiary" onClick={() => setPhase('idle')}>
              Upload more
            </Button>
          </div>
        ) : null}
      </Card>
    );
  },
};

// --- Nothing to show ----------------------------------------------------------------------------

interface Matter {
  id: number;
  matter: string;
  client: string;
  court: string;
  deadline: string;
}

const matters: Matter[] = [
  { id: 1, matter: 'Rivera v. Atlantic Insurance', client: 'Elena Rivera', court: 'Superior Court of New Jersey', deadline: 'Nov 6, 2026' },
  { id: 2, matter: 'Estate of Harold Chen', client: 'Margaret Chen', court: 'Bergen County Surrogate’s Court', deadline: 'Nov 12, 2026' },
  { id: 3, matter: 'Okafor v. Northgate Logistics', client: 'Daniel Okafor', court: 'U.S. District Court, D.N.J.', deadline: 'Nov 20, 2026' },
  { id: 4, matter: 'Morales v. Harbor Point Condominium', client: 'Luis Morales', court: 'Superior Court of New Jersey', deadline: 'Dec 15, 2026' },
];

const matterColumns: Array<TableColumn<Matter>> = [
  { key: 'matter', header: 'Matter', emphasis: 'strong' },
  { key: 'client', header: 'Client' },
  { key: 'court', header: 'Court' },
  { key: 'deadline', header: 'Next deadline', align: 'end' },
];

interface MatterDocument {
  id: number;
  name: string;
  kind: string;
  uploaded: string;
}

const documentColumns: Array<TableColumn<MatterDocument>> = [
  { key: 'name', header: 'Document', emphasis: 'strong' },
  { key: 'kind', header: 'Type' },
  { key: 'uploaded', header: 'Uploaded', align: 'end' },
];

/** A new matter with no documents yet, and a search that matched nothing: two kinds of empty. */
export const NothingYetOrNoResults: Story = {
  render: function Render() {
    const [search, setSearch] = React.useState('Hendricks');
    const term = search.trim().toLowerCase();
    const found = matters.filter(({ matter, client }) => `${matter} ${client}`.toLowerCase().includes(term));
    return (
      <div className={styles.stack}>
        <Table
          title="Documents"
          headingLevel={3}
          description="Whitaker Family Trust"
          columns={documentColumns}
          data={[] as MatterDocument[]}
          getRowId={({ id }) => id}
          empty={
            <EmptyState heading="No documents yet" headingLevel={4} actions={<Button prominence="primary">Upload a document</Button>}>
              Documents you upload to this matter appear here.
            </EmptyState>
          }
        />
        <Table
          title="Matters"
          headingLevel={3}
          columns={matterColumns}
          data={found}
          getRowId={({ id }) => id}
          searchable
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search matters and clients"
          empty={
            <EmptyState
              heading={`No matters match “${search.trim()}”`}
              headingLevel={4}
              actions={
                <Button prominence="tertiary" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              }
            >
              Check the spelling, or search for the client’s name.
            </EmptyState>
          }
        />
      </div>
    );
  },
};

// --- A load that fails ------------------------------------------------------------------------

const documents: MatterDocument[] = [
  { id: 1, name: 'engagement-letter.pdf', kind: 'Agreement', uploaded: 'Oct 2, 2026' },
  { id: 2, name: 'complaint.pdf', kind: 'Pleading', uploaded: 'Oct 9, 2026' },
  { id: 3, name: 'answer-draft.docx', kind: 'Pleading', uploaded: 'Oct 15, 2026' },
];

/** The table loads with skeleton rows. The first load fails, and the failure says so, with a way to try again. */
export const LoadFailed: Story = {
  render: function Render() {
    const { loading, outcome, reload } = useLoad(failsEveryOtherTime);
    if (!loading && outcome === 'failed') {
      return (
        <SectionMessage
          tone="error"
          title="We couldn’t load the documents"
          actions={
            <Button size="sm" onClick={reload}>
              Try again
            </Button>
          }
        >
          The document service didn’t respond. Check your connection, then try again.
        </SectionMessage>
      );
    }
    return (
      <Table
        title="Documents"
        headingLevel={3}
        description="Rivera v. Atlantic Insurance"
        columns={documentColumns}
        data={loading ? [] : documents}
        getRowId={({ id }) => id}
        loading={loading}
        skeletonRowCount={documents.length}
        actions={
          <Button size="sm" prominence="tertiary" onClick={reload}>
            Refresh
          </Button>
        }
      />
    );
  },
};
