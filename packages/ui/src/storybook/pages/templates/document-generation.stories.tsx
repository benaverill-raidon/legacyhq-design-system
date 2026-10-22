import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DownloadIcon, MoreVertIcon, RetryIcon, SignatureIcon } from '../../../assets/icons';
import { Button } from '../../../components/atoms/button';
import { CheckboxGroup } from '../../../components/atoms/checkbox';
import { IconButton } from '../../../components/atoms/icon-button';
import { Label } from '../../../components/atoms/label';
import { Link } from '../../../components/atoms/link';
import { LinkButton } from '../../../components/atoms/link-button';
import { ProgressBar } from '../../../components/atoms/progress-bar';
import { Breadcrumbs } from '../../../components/molecules/breadcrumbs';
import { ButtonGroup } from '../../../components/molecules/button-group';
import { Field } from '../../../components/molecules/field';
import { TextField } from '../../../components/molecules/text-field';
import { DropdownMenu } from '../../../components/organisms/dropdown-menu';
import { Form, FormFooter, FormRow, FormSection } from '../../../components/organisms/form';
import { ModalDialog } from '../../../components/organisms/modal-dialog';
import { ProgressTracker } from '../../../components/organisms/progress-tracker';
import { SectionMessage } from '../../../components/organisms/section-message';
import { Table } from '../../../components/organisms/table';
import type { TableColumn } from '../../../components/organisms/table';
import { toast, ToastGroup } from '../../../components/organisms/toast-group';
import styles from './document-generation.module.css';

// Templates / Document Generation: a draft of the whole workflow, built only from system components
// ahead of the final designs. Every step name, document, detail, and status here is a placeholder;
// the template page lists them as open questions. The local stylesheet lays the screen out and sets
// the type of its own headings and text; it never restyles a component. The template page lists
// every component imported here as "Components used".

const meta = {
  title: 'Templates/Document Generation',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Placeholder content ------------------------------------------------------------------------

type DocumentId = 'will' | 'trust' | 'certificate' | 'poa' | 'health-care' | 'living-will';
type DetailKey = 'clientName' | 'county' | 'address' | 'executor' | 'trustee' | 'agent' | 'healthCareAgent';

interface DocumentTemplate {
  value: DocumentId;
  label: string;
  pages: number;
  /** The details from the matter this document is drawn up with. */
  needs: DetailKey[];
}

const TEMPLATES: DocumentTemplate[] = [
  { value: 'will', label: 'Last will and testament', pages: 12, needs: ['clientName', 'county', 'address', 'executor'] },
  { value: 'trust', label: 'Revocable living trust agreement', pages: 24, needs: ['clientName', 'address', 'trustee'] },
  { value: 'certificate', label: 'Certificate of trust', pages: 2, needs: ['clientName', 'trustee'] },
  { value: 'poa', label: 'Durable power of attorney', pages: 8, needs: ['clientName', 'address', 'agent'] },
  { value: 'health-care', label: 'Health care power of attorney', pages: 6, needs: ['clientName', 'healthCareAgent'] },
  { value: 'living-will', label: 'Living will', pages: 4, needs: ['clientName', 'healthCareAgent'] },
];

/** The estate plan package starts with every document but the living will. */
const PACKAGE: DocumentId[] = ['will', 'trust', 'certificate', 'poa', 'health-care'];

interface Detail {
  key: DetailKey;
  label: string;
  /** What to do when it's blank: the field's error, and its line in the summary. */
  error: string;
  autoComplete?: string;
}

const CLIENT_DETAILS: Detail[] = [
  { key: 'clientName', label: 'Full legal name', error: "Enter the client's full legal name.", autoComplete: 'off' },
  { key: 'county', label: 'County of residence', error: 'Enter the county the client lives in.', autoComplete: 'off' },
  { key: 'address', label: 'Home address', error: "Enter the client's home address.", autoComplete: 'off' },
];

const PEOPLE_DETAILS: Detail[] = [
  { key: 'executor', label: 'Executor', error: "Enter the executor's full name." },
  { key: 'trustee', label: 'Successor trustee', error: "Enter the successor trustee's full name." },
  { key: 'agent', label: 'Agent', error: "Enter the agent's full name." },
  { key: 'healthCareAgent', label: 'Health care agent', error: "Enter the health care agent's full name." },
];

interface Matter {
  name: string;
  /** The client the documents are drawn up for, or null when the matter has none yet. */
  client: string | null;
  details: Record<DetailKey, string>;
}

const LEE: Matter = {
  name: 'Lee estate plan',
  client: 'Jordan Lee',
  details: {
    clientName: 'Jordan Avery Lee',
    county: 'Mercer',
    address: '14 Harbor Lane, Princeton, NJ 08540',
    executor: 'Morgan Lee',
    // Not in the matter yet, so the details step has a required field to fill.
    trustee: '',
    agent: 'Morgan Lee',
    healthCareAgent: 'Riley Lee',
  },
};

const LEE_COMPLETE: Matter = { ...LEE, details: { ...LEE.details, trustee: 'Morgan Lee' } };

const NGUYEN: Matter = {
  name: 'Nguyen estate plan',
  client: null,
  details: { clientName: '', county: '', address: '', executor: '', trustee: '', agent: '', healthCareAgent: '' },
};

/** "A", "A and B", "A, B, and C". */
const listOf = (items: string[]) => (items.length < 3 ? items.join(' and ') : `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`);
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const labelOf = (id: DocumentId) => TEMPLATES.find(({ value }) => value === id)?.label ?? id;

// --- The flow -----------------------------------------------------------------------------------

type Step = 1 | 2 | 3 | 4;
type FieldError = { key: string; label: string; message: string };
type FocusTarget = 'heading' | 'summary' | 'failure';
type DocumentStatus = 'ready' | 'needs-review' | 'sent';

interface GeneratedDocument {
  id: DocumentId;
  name: string;
  pages: number;
  status: DocumentStatus;
}

const STATUS: Record<DocumentStatus, { label: string; tone: 'success' | 'warning' | 'information' }> = {
  ready: { label: 'Ready', tone: 'success' },
  'needs-review': { label: 'Needs review', tone: 'warning' },
  sent: { label: 'Awaiting signature', tone: 'information' },
};

const GENERATE_DELAY = 700;

// The screen's headings sit inside this page's outline, under "The template" (an h2). In the
// product, the page heading is the h1 and the rest follow from it.
const PageHeading = 'h3';
const StepHeading = 'h4';
const TABLE_HEADING_LEVEL = 5;

/** A failed step's summary: what to fix, each line a link that moves focus to its field. */
function ErrorSummary({ errors, action, onFocusField, summaryRef }: { errors: FieldError[]; action: string; onFocusField: (key: string) => void; summaryRef: React.Ref<HTMLDivElement> }) {
  return (
    <FormSection>
      <SectionMessage ref={summaryRef} tabIndex={-1} tone="error" title={`Fix ${count(errors.length, 'field', 'fields')} to ${action}`}>
        <ul className={styles.errorList}>
          {errors.map(({ key, label, message }) => (
            <li key={key}>
              <Link
                href={`#${key}`}
                emphasis="default"
                onClick={(event) => {
                  event.preventDefault();
                  onFocusField(key);
                }}
              >
                {label}
              </Link>
              : {message}
            </li>
          ))}
        </ul>
      </SectionMessage>
    </FormSection>
  );
}

/** One generated document's actions, behind one Icon Button named for the document. */
function DocumentActions({ document, onRegenerate }: { document: GeneratedDocument; onRegenerate: (document: GeneratedDocument) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu
      aria-label={`Actions for ${document.name}`}
      open={open}
      onOpenChange={setOpen}
      showSearch={false}
      size="sm"
      alignment="end"
      sections={[
        {
          id: 'actions',
          items: [
            { id: 'download', label: 'Download', onSelect: () => toast.success(`${document.name} downloaded`) },
            { id: 'regenerate', label: 'Regenerate', disabled: document.status === 'sent', onSelect: () => onRegenerate(document) },
          ],
        },
      ]}
    >
      <IconButton appearance="subtle" isExpanded={open} aria-label={`Actions for ${document.name}`} onClick={() => setOpen((current) => !current)}>
        <MoreVertIcon />
      </IconButton>
    </DropdownMenu>
  );
}

interface DocumentGenerationProps {
  matter: Matter;
  /** Where the story starts: 1 (choose documents) or 2 (confirm the details, as if step 1 were done). */
  initialStep?: 1 | 2;
  /** The first generation stops after this many documents, so it fails partway. A retry finishes. */
  failAfter?: number;
  /** Mounts the page's one Toast Group. */
  withToasts?: boolean;
}

/**
 * The whole workflow for one matter. Every value people enter lives here, above the steps, so going
 * back to an earlier step keeps it.
 */
function DocumentGeneration({ matter, initialStep = 1, failAfter, withToasts = false }: DocumentGenerationProps) {
  const prefix = React.useId();
  const idOf = (key: string) => `${prefix}-${key}`;
  const blocked = matter.client == null;

  const [step, setStep] = React.useState<Step>(initialStep);
  const [chosen, setChosen] = React.useState<string[]>(PACKAGE);
  const [details, setDetails] = React.useState(matter.details);

  // Each form step checks on submit, then its fields' errors follow their values. The summary lists
  // the errors as of the last submit, since it's a live region.
  const [checked, setChecked] = React.useState<{ 1: boolean; 2: boolean }>({ 1: false, 2: false });
  const [summary, setSummary] = React.useState<{ 1: FieldError[]; 2: FieldError[] }>({ 1: [], 2: [] });

  const [generated, setGenerated] = React.useState<DocumentId[]>([]);
  const [phase, setPhase] = React.useState<'idle' | 'running' | 'failed'>('idle');
  const [documents, setDocuments] = React.useState<GeneratedDocument[]>([]);
  const [confirming, setConfirming] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  // Focus moves only after something people did, never when the story first renders.
  const [focusRequest, setFocusRequest] = React.useState<{ target: FocusTarget; id: number } | null>(null);
  const requestFocus = (target: FocusTarget) => setFocusRequest((current) => ({ target, id: (current?.id ?? 0) + 1 }));
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const failureRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!focusRequest) return;
    const target = { heading: headingRef, summary: summaryRef, failure: failureRef }[focusRequest.target];
    target.current?.focus();
  }, [focusRequest]);

  const timer = React.useRef<number | undefined>(undefined);
  const attempts = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const chosenTemplates = TEMPLATES.filter(({ value }) => chosen.includes(value));
  const needed = new Set(chosenTemplates.flatMap(({ needs }) => needs));
  const shownDetails = [...CLIENT_DETAILS, ...PEOPLE_DETAILS].filter(({ key }) => needed.has(key));
  const usedIn = (key: DetailKey) => {
    const using = chosenTemplates.filter(({ needs }) => needs.includes(key));
    return using.length === chosenTemplates.length && using.length > 1 ? 'Used in every document.' : `Used in the ${listOf(using.map(({ label }) => label))}.`;
  };

  const checkDocuments = (): FieldError[] =>
    chosen.length === 0 ? [{ key: 'documents', label: 'Documents', message: 'Choose at least one document to generate.' }] : [];
  const checkDetails = (): FieldError[] =>
    shownDetails.filter(({ key }) => !details[key].trim()).map(({ key, label, error }) => ({ key, label, message: error }));

  const documentErrors = checked[1] ? checkDocuments() : [];
  const detailErrors = checked[2] ? checkDetails() : [];
  const errorFor = (key: DetailKey) => detailErrors.find((error) => error.key === key)?.message;

  const goTo = (next: Step) => {
    setStep(next);
    requestFocus('heading');
  };

  const focusField = (key: string) => {
    const target = key === 'documents' ? document.querySelector<HTMLInputElement>(`input[name="${idOf('documents')}"]`) : document.getElementById(idOf(key));
    target?.focus();
  };

  const finish = (ids: DocumentId[]) => {
    setPhase('idle');
    // A placeholder for whatever the generator reports: the trust's Schedule A has no assets to list.
    setDocuments(ids.map((id) => ({ id, name: labelOf(id), pages: TEMPLATES.find(({ value }) => value === id)?.pages ?? 1, status: id === 'trust' ? 'needs-review' : 'ready' })));
    goTo(4);
    toast.success(`${count(ids.length, 'document', 'documents')} generated`, { description: `Review them, then send them to ${matter.client} for signature.` });
  };

  /** Generates every chosen document not in `kept`, one at a time, counting the whole package. */
  const generate = (kept: DocumentId[]) => {
    attempts.current += 1;
    const failing = failAfter != null && attempts.current === 1;
    const all = chosenTemplates.map(({ value }) => value);
    const queue = all.filter((id) => !kept.includes(id));
    setGenerated(kept);
    setPhase('running');
    window.clearTimeout(timer.current);
    const next = (done: DocumentId[], index: number) => {
      timer.current = window.setTimeout(() => {
        if (failing && done.length === failAfter) {
          setPhase('failed');
          requestFocus('failure');
          return;
        }
        const now = [...done, queue[index]];
        setGenerated(now);
        if (index + 1 < queue.length) next(now, index + 1);
        else finish(all.filter((id) => now.includes(id)));
      }, GENERATE_DELAY);
    };
    next(kept, 0);
  };

  // Trying again removes the error and its button, so focus goes back to the step's heading.
  const retry = () => {
    requestFocus('heading');
    generate(generated);
  };

  const submitDocuments = (event: React.FormEvent) => {
    event.preventDefault();
    const failed = checkDocuments();
    setChecked((current) => ({ ...current, 1: true }));
    setSummary((current) => ({ ...current, 1: failed }));
    if (failed.length > 0) {
      requestFocus('summary');
      return;
    }
    goTo(2);
  };

  const submitDetails = (event: React.FormEvent) => {
    event.preventDefault();
    const failed = checkDetails();
    setChecked((current) => ({ ...current, 2: true }));
    setSummary((current) => ({ ...current, 2: failed }));
    if (failed.length > 0) {
      requestFocus('summary');
      return;
    }
    // Changing the documents or the details means generating the package again, from the start.
    setDocuments([]);
    goTo(3);
    generate([]);
  };

  const regenerate = (target: GeneratedDocument) => {
    const id = toast.loading(`Regenerating ${target.name}…`);
    window.setTimeout(() => toast.success(`${target.name} regenerated`, { id }), 1500);
  };

  const send = () => {
    setConfirming(false);
    setSent(true);
    setDocuments((current) => current.map((item) => ({ ...item, status: 'sent' })));
    requestFocus('heading');
    toast.success('Sent for signature', { description: `${count(documents.length, 'document was', 'documents were')} sent to ${matter.client}.` });
  };

  // Steps already done are links back to them, except while the documents are generating or once
  // they've been sent. Generate isn't one: going back to it means submitting the details again.
  const canGoBack = phase !== 'running' && !sent;
  const back = (target: Step) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    goTo(target);
  };
  const steps = [
    { label: 'Documents', href: canGoBack ? '#documents' : undefined, onClick: back(1) },
    { label: 'Details', href: canGoBack ? '#details' : undefined, onClick: back(2) },
    { label: 'Generate' },
    { label: 'Review' },
  ];

  const total = chosenTemplates.length;
  const generatedText = `${generated.length} of ${count(total, 'document', 'documents')} generated`;
  const failedNames = chosenTemplates.filter(({ value }) => !generated.includes(value)).map(({ label }) => label);
  const needsReview = documents.filter(({ status }) => status === 'needs-review');

  const detailField = ({ key, label, autoComplete }: Detail) => {
    const error = errorFor(key);
    const blank = !matter.details[key].trim();
    const helper = `${blank ? 'Not in the matter yet. ' : ''}${usedIn(key)}`;
    return (
      <Field key={key} label={label} required state={error ? 'error' : 'default'} message={error ?? helper}>
        <TextField
          id={idOf(key)}
          invalid={Boolean(error)}
          value={details[key]}
          autoComplete={autoComplete}
          onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))}
        />
      </Field>
    );
  };
  const shown = (list: Detail[]) => list.filter(({ key }) => needed.has(key));
  /** Short fields side by side, two to a row; a lone last field keeps its half of the row. */
  const rowsOf = (list: Detail[]) =>
    Array.from({ length: Math.ceil(list.length / 2) }, (_, index) => (
      <FormRow key={list[index * 2].key}>
        {detailField(list[index * 2])}
        {list[index * 2 + 1] ? detailField(list[index * 2 + 1]) : <div />}
      </FormRow>
    ));

  const generatedColumns: Array<TableColumn<GeneratedDocument>> = [
    {
      key: 'name',
      header: 'Document',
      emphasis: 'strong',
      minWidth: 260,
      render: (item) => (
        <Link href={`#document-${item.id}`} emphasis="strong">
          {item.name}
        </Link>
      ),
    },
    { key: 'pages', header: 'Pages', align: 'end' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Label size="sm" tone={STATUS[item.status].tone}>
          {STATUS[item.status].label}
        </Label>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerLabel: 'Actions',
      align: 'end',
      resizable: false,
      render: (item) => <DocumentActions document={item} onRegenerate={regenerate} />,
    },
  ];

  const progressColumns: Array<TableColumn<DocumentTemplate>> = [
    { key: 'label', header: 'Document', emphasis: 'strong', minWidth: 260 },
    {
      key: 'status',
      header: 'Status',
      render: (item) =>
        generated.includes(item.value) ? (
          <Label size="sm" tone="success">
            Generated
          </Label>
        ) : (
          <Label size="sm" tone="error">
            Not generated
          </Label>
        ),
    },
  ];

  const stepHeading = (text: string) => (
    <StepHeading ref={headingRef} tabIndex={-1} id={idOf('step')} className={styles.stepTitle}>
      {text}
    </StepHeading>
  );

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <Breadcrumbs
          items={[
            { label: 'Matters', href: '#matters' },
            { label: matter.name, href: '#matter' },
            { label: 'Generate documents' },
          ]}
        />
        <PageHeading className={styles.title}>Generate documents</PageHeading>
        <p className={styles.context}>{matter.client ? `For ${matter.client}, from the ${matter.name} matter.` : `From the ${matter.name} matter.`}</p>
      </div>

      <ProgressTracker steps={steps} currentStep={step} disabled={blocked} aria-label="Document generation" />

      <section className={styles.step} aria-labelledby={idOf('step')}>
        {step === 1 && blocked ? (
          <>
            {stepHeading('Choose documents')}
            <SectionMessage
              tone="warning"
              title="Add a client to the matter first"
              actions={
                <LinkButton href="#matter-client" appearance="subtle" size="sm">
                  Add a client
                </LinkButton>
              }
            >
              Every document in the package is drawn up for the matter&apos;s client, and the {matter.name} matter doesn&apos;t have one yet.
            </SectionMessage>
          </>
        ) : null}

        {step === 1 && !blocked ? (
          <>
            {stepHeading('Choose documents')}
            <Form className={styles.narrow} description="The estate plan package is chosen to start with. Uncheck any document the client doesn't need." requiredLegend noValidate onSubmit={submitDocuments}>
              {summary[1].length > 0 ? <ErrorSummary errors={summary[1]} action="continue" onFocusField={focusField} summaryRef={summaryRef} /> : null}
              <FormSection>
                <CheckboxGroup
                  label="Documents"
                  description="Each is drawn up from the firm's template, with the details you confirm next."
                  required
                  name={idOf('documents')}
                  invalid={documentErrors.length > 0}
                  errorMessage={documentErrors[0]?.message}
                  value={chosen}
                  onValueChange={setChosen}
                  options={TEMPLATES.map(({ value, label }) => ({ value, label }))}
                />
              </FormSection>
              <FormFooter>
                <Button prominence="primary" type="submit">
                  Continue
                </Button>
              </FormFooter>
            </Form>
          </>
        ) : null}

        {step === 2 ? (
          <>
            {stepHeading('Confirm the details')}
            <Form
              className={styles.narrow}
              description="These come from the matter. Every document uses them exactly as they are here, so check them before you generate."
              requiredLegend
              noValidate
              onSubmit={submitDetails}
            >
              {summary[2].length > 0 ? <ErrorSummary errors={summary[2]} action="generate the documents" onFocusField={focusField} summaryRef={summaryRef} /> : null}
              {shown(CLIENT_DETAILS).length > 0 ? (
                <FormSection title="Client">
                  {needed.has('clientName') || needed.has('county') ? rowsOf(shown(CLIENT_DETAILS).filter(({ key }) => key !== 'address')) : null}
                  {needed.has('address') ? detailField(CLIENT_DETAILS[2]) : null}
                </FormSection>
              ) : null}
              {shown(PEOPLE_DETAILS).length > 0 ? <FormSection title="People named in the documents">{rowsOf(shown(PEOPLE_DETAILS))}</FormSection> : null}
              <FormFooter>
                <Button prominence="tertiary" onClick={() => goTo(1)}>
                  Back
                </Button>
                <Button prominence="primary" type="submit">
                  {`Generate ${count(total, 'document', 'documents')}`}
                </Button>
              </FormFooter>
            </Form>
          </>
        ) : null}

        {step === 3 ? (
          <>
            {stepHeading('Generating the documents')}
            {phase === 'failed' ? (
              <>
                <SectionMessage
                  ref={failureRef}
                  tabIndex={-1}
                  tone="error"
                  title={`${count(failedNames.length, "document wasn't", "documents weren't")} generated`}
                  actions={
                    <Button size="sm" iconBefore={<RetryIcon />} onClick={retry}>
                      {`Try the ${count(failedNames.length, 'document', 'documents')} again`}
                    </Button>
                  }
                >
                  The document service stopped responding before the {listOf(failedNames)}. The {count(generated.length, 'document', 'documents')} already generated
                  {generated.length === 1 ? ' is' : ' are'} kept, so trying again generates only the rest.
                </SectionMessage>
                <Table
                  title="Documents"
                  headingLevel={TABLE_HEADING_LEVEL}
                  description={generatedText}
                  columns={progressColumns}
                  data={chosenTemplates}
                  getRowId={({ value }) => value}
                />
                <div className={styles.actions}>
                  <Button prominence="tertiary" onClick={() => goTo(2)}>
                    Back
                  </Button>
                </div>
              </>
            ) : (
              <div className={`${styles.progress} ${styles.narrow}`}>
                <ProgressBar value={total > 0 ? (generated.length / total) * 100 : 0} label={`Generating documents for the ${matter.name}`} getValueText={() => generatedText} />
                <p className={styles.status}>{generatedText}</p>
              </div>
            )}
          </>
        ) : null}

        {step === 4 ? (
          <>
            {stepHeading(sent ? 'Sent for signature' : 'Review the package')}
            {needsReview.length > 0 && !sent ? (
              <SectionMessage
                tone="warning"
                title={`${count(needsReview.length, 'document needs', 'documents need')} review`}
                actions={
                  <LinkButton href="#document-trust" appearance="subtle" size="sm">
                    Open the trust agreement
                  </LinkButton>
                }
              >
                Schedule A of the Revocable living trust agreement lists no assets, because none are linked to the matter. Add them before the client signs.
              </SectionMessage>
            ) : null}
            <Table
              title="Documents"
              headingLevel={TABLE_HEADING_LEVEL}
              description={`${count(documents.length, 'document', 'documents')} for ${matter.client}, generated from the firm's templates.`}
              columns={generatedColumns}
              data={documents}
              getRowId={({ id }) => id}
            />
            <div className={styles.actions}>
              {sent ? (
                <LinkButton href="#matter">Back to the matter</LinkButton>
              ) : (
                <ButtonGroup>
                  <Button iconBefore={<DownloadIcon />} onClick={() => toast.success(`${count(documents.length, 'document', 'documents')} downloaded`)}>
                    Download all
                  </Button>
                  <Button prominence="primary" iconBefore={<SignatureIcon />} onClick={() => setConfirming(true)}>
                    Send for signature
                  </Button>
                </ButtonGroup>
              )}
            </div>
            <ModalDialog
              open={confirming}
              onClose={() => setConfirming(false)}
              title={`Send ${count(documents.length, 'document', 'documents')} to ${matter.client} for signature?`}
              footer={
                <ButtonGroup>
                  <Button prominence="tertiary" onClick={() => setConfirming(false)}>
                    Cancel
                  </Button>
                  <Button prominence="primary" onClick={send}>
                    Send for signature
                  </Button>
                </ButtonGroup>
              }
            >
              {matter.client} gets an email with a link to sign them. You can&apos;t change the documents once they&apos;re sent.
              {needsReview.length > 0 ? ` The ${listOf(needsReview.map(({ name }) => name))} still ${needsReview.length === 1 ? 'needs' : 'need'} review.` : ''}
            </ModalDialog>
          </>
        ) : null}
      </section>
      {withToasts ? <ToastGroup /> : null}
    </div>
  );
}

// --- Stories ------------------------------------------------------------------------------------

/**
 * The whole workflow for the Lee estate plan: choose the documents, confirm the details (one is
 * missing), generate them, review the package, and send it for signature. Going back keeps what was
 * entered.
 */
export const GenerateAPackage: Story = {
  render: () => <DocumentGeneration matter={LEE} withToasts />,
};

/**
 * The details are complete. Generate the documents: the service stops after the first three, which
 * are kept, and trying again generates only the other two.
 */
export const GenerationFailsPartway: Story = {
  render: () => <DocumentGeneration matter={LEE_COMPLETE} initialStep={2} failAfter={3} />,
};

/** The matter has no client yet, so there's nothing to draw the documents up for. */
export const MatterWithoutAClient: Story = {
  render: () => <DocumentGeneration matter={NGUYEN} />,
};
