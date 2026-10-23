import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../../components/atoms/button';
import { Checkbox, CheckboxGroup } from '../../../components/atoms/checkbox';
import { RadioGroup } from '../../../components/atoms/radio';
import { Switch } from '../../../components/atoms/switch';
import { Field } from '../../../components/molecules/field';
import { InlineEdit } from '../../../components/molecules/inline-edit';
import { KeyValueList } from '../../../components/molecules/key-value-list';
import { KeyValuePair } from '../../../components/molecules/key-value-pair';
import { Select } from '../../../components/molecules/select';
import { TextArea } from '../../../components/molecules/text-area';
import { TextField } from '../../../components/molecules/text-field';
import { DatePicker } from '../../../components/organisms/date-picker';
import { DateTimePicker } from '../../../components/organisms/date-time-picker';
import { Form, FormFooter, FormRow, FormSection } from '../../../components/organisms/form';
import { SectionMessage } from '../../../components/organisms/section-message';
import { toast } from '../../../components/organisms/toast-group';
import styles from './forms-and-validation.module.css';

// Examples for Patterns / Forms and Validation, built only from system components. The local
// stylesheet lays them out; it never restyles a component. The pattern page lists every component
// imported here as "Components used".

const meta = {
  title: 'Patterns/Forms and Validation',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TODAY = new Date(2026, 9, 19);

const MATTER_TYPES = [
  { value: 'estate', label: 'Estate planning' },
  { value: 'probate', label: 'Probate' },
  { value: 'real-estate', label: 'Real estate' },
  { value: 'litigation', label: 'Civil litigation' },
  { value: 'family', label: 'Family law' },
];

const ATTORNEYS = [
  { value: 'averill', label: 'Jordan Averill' },
  { value: 'okafor', label: 'Amara Okafor' },
  { value: 'reyes', label: 'Daniel Reyes' },
];

const stop = (event: React.FormEvent) => event.preventDefault();

/** A matter intake form: sections, rows of short fields, required fields, and helper text. */
export const MatterIntake: Story = {
  render: function Render() {
    const [matterType, setMatterType] = React.useState<string | null>('estate');
    const [attorney, setAttorney] = React.useState<string | null>('okafor');
    return (
      <Form title="New matter" description="Open a matter for a new or existing client." requiredLegend onSubmit={stop}>
        <FormSection title="Client">
          <FormRow>
            <Field label="First name" required>
              <TextField defaultValue="Jordan" autoComplete="given-name" />
            </Field>
            <Field label="Last name" required>
              <TextField defaultValue="Lee" autoComplete="family-name" />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Email" message="We'll send the engagement letter here.">
              <TextField type="email" defaultValue="jordan.lee@example.com" autoComplete="email" />
            </Field>
            <Field label="Phone">
              <TextField type="tel" defaultValue="(609) 555-0142" autoComplete="tel" />
            </Field>
          </FormRow>
          <RadioGroup
            label="Preferred contact"
            orientation="horizontal"
            defaultValue="email"
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'mail', label: 'Mail' },
            ]}
          />
        </FormSection>
        <FormSection title="Matter">
          <FormRow>
            <Field label="Matter name" required message="Shown on every document in the matter.">
              <TextField defaultValue="Lee Living Trust" />
            </Field>
            <Field label="Matter type" required>
              <Select options={MATTER_TYPES} value={matterType} onChange={setMatterType} placeholder="Choose a type" />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Responsible attorney">
              <Select options={ATTORNEYS} value={attorney} onChange={setAttorney} placeholder="Choose an attorney" />
            </Field>
            <Field label="Opened">
              <DatePicker defaultValue={TODAY} today={TODAY} />
            </Field>
          </FormRow>
          <Field label="First meeting" message="We'll add it to the attorney's calendar.">
            <DateTimePicker defaultValue={new Date(2026, 9, 26, 10, 30)} today={TODAY} />
          </Field>
          <RadioGroup
            label="Billing"
            required
            defaultValue="flat"
            options={[
              { value: 'hourly', label: 'Hourly' },
              { value: 'flat', label: 'Flat fee' },
              { value: 'contingency', label: 'Contingency' },
            ]}
          />
        </FormSection>
        <FormSection title="Intake">
          <CheckboxGroup
            label="Documents received"
            description="Check everything the client has handed over."
            orientation="horizontal"
            defaultValue={['id']}
            options={[
              { value: 'id', label: 'Photo ID' },
              { value: 'will', label: 'Existing will' },
              { value: 'deeds', label: 'Property deeds' },
            ]}
          />
          <Field label="Intake notes" message="Only people at the firm can see these notes.">
            <TextArea defaultValue="Client wants the trust in place before the house closing in December." />
          </Field>
          <Checkbox label="I've run a conflict check for this client" required defaultChecked />
        </FormSection>
        <FormFooter>
          <Button prominence="tertiary">Cancel</Button>
          <Button prominence="primary" type="submit">
            Create matter
          </Button>
        </FormFooter>
      </Form>
    );
  },
};

type Values = { clientName: string; matterName: string; matterType: string | null; opened: Date | null; conflictCheck: boolean };

const EMPTY: Values = { clientName: 'Rivera', matterName: '', matterType: null, opened: null, conflictCheck: false };

type FieldKey = keyof Values;
type FieldError = { key: FieldKey; label: string; message: string };

/** Your own check, run on submit: one entry per field that needs fixing, in the order of the form. */
function check(values: Values): FieldError[] {
  const failing: Array<[boolean, FieldError]> = [
    [values.clientName.trim().split(/\s+/).length < 2, { key: 'clientName', label: 'Client name', message: "Enter the client's first and last name." }],
    [!values.matterName.trim(), { key: 'matterName', label: 'Matter name', message: 'Enter a name for the matter, such as Rivera v. Atlantic Insurance.' }],
    [!values.matterType, { key: 'matterType', label: 'Matter type', message: 'Choose the type of matter.' }],
    [!values.opened, { key: 'opened', label: 'Opened', message: 'Choose the date the matter was opened.' }],
    [!values.conflictCheck, { key: 'conflictCheck', label: 'Conflict check', message: 'Run a conflict check before you open the matter.' }],
  ];
  return failing.filter(([fails]) => fails).map(([, error]) => error);
}

/**
 * Submit with the form as it is. The summary takes focus and links to each field; each field says
 * what to do. Fix them and submit again: the button shows it's busy, then a toast confirms.
 */
export const SubmitAndValidate: Story = {
  render: function Render() {
    const prefix = React.useId();
    const ids: Record<FieldKey, string> = {
      clientName: `${prefix}-client`,
      matterName: `${prefix}-matter`,
      matterType: `${prefix}-type`,
      opened: `${prefix}-opened`,
      conflictCheck: `${prefix}-conflict-check`,
    };
    const [values, setValues] = React.useState<Values>(EMPTY);
    const [submitted, setSubmitted] = React.useState(false);
    const [attempt, setAttempt] = React.useState(0);
    // What the summary lists: the errors as of the last submit. It's a live region, so it doesn't
    // change while people type; the fields do.
    const [summaryErrors, setSummaryErrors] = React.useState<FieldError[]>([]);
    const [saving, setSaving] = React.useState(false);
    const summary = React.useRef<HTMLDivElement>(null);

    // After a failed submit, each field's error follows its value, so it clears as soon as it's fixed.
    const errors = submitted ? check(values) : [];
    const errorFor = (key: FieldKey) => errors.find((error) => error.key === key)?.message;
    const set = <K extends FieldKey>(key: K, value: Values[K]) => setValues((current) => ({ ...current, [key]: value }));

    // Move focus to the summary after each failed submit, so it's read out and people start there.
    React.useEffect(() => {
      if (attempt > 0) summary.current?.focus();
    }, [attempt]);

    const reset = () => {
      setValues(EMPTY);
      setSubmitted(false);
      setAttempt(0);
      setSummaryErrors([]);
    };

    const submit = (event: React.FormEvent) => {
      event.preventDefault();
      if (saving) return;
      setSubmitted(true);
      const failed = check(values);
      setSummaryErrors(failed);
      if (failed.length > 0) {
        setAttempt((count) => count + 1);
        return;
      }
      setSaving(true);
      window.setTimeout(() => {
        setSaving(false);
        reset();
        toast.success('Matter created', { description: `${values.matterName} was opened for ${values.clientName}.` });
      }, 1500);
    };

    return (
      <>
        <Form title="New matter" requiredLegend noValidate onSubmit={submit}>
          {summaryErrors.length > 0 ? (
            <FormSection>
              <SectionMessage
                ref={summary}
                tabIndex={-1}
                tone="error"
                title={`Fix ${summaryErrors.length === 1 ? '1 field' : `${summaryErrors.length} fields`} to create the matter`}
                errors={summaryErrors.map(({ key, label, message }) => ({ label, message, targetId: ids[key] }))}
              />
            </FormSection>
          ) : null}
          <FormSection title="Client">
            <Field label="Client name" required state={errorFor('clientName') ? 'error' : 'default'} message={errorFor('clientName') ?? 'First and last name.'}>
              <TextField
                id={ids.clientName}
                invalid={Boolean(errorFor('clientName'))}
                value={values.clientName}
                onChange={(event) => set('clientName', event.target.value)}
              />
            </Field>
          </FormSection>
          <FormSection title="Matter">
            <FormRow>
              <Field label="Matter name" required state={errorFor('matterName') ? 'error' : 'default'} message={errorFor('matterName')}>
                <TextField
                  id={ids.matterName}
                  invalid={Boolean(errorFor('matterName'))}
                  value={values.matterName}
                  onChange={(event) => set('matterName', event.target.value)}
                />
              </Field>
              <Field label="Matter type" required state={errorFor('matterType') ? 'error' : 'default'} message={errorFor('matterType')}>
                <Select
                  id={ids.matterType}
                  invalid={Boolean(errorFor('matterType'))}
                  options={MATTER_TYPES}
                  value={values.matterType}
                  onChange={(value) => set('matterType', value)}
                  placeholder="Choose a type"
                />
              </Field>
            </FormRow>
            <Field label="Opened" required state={errorFor('opened') ? 'error' : 'default'} message={errorFor('opened')}>
              <DatePicker id={ids.opened} invalid={Boolean(errorFor('opened'))} value={values.opened} onChange={(date) => set('opened', date)} today={TODAY} />
            </Field>
            <Checkbox
              id={ids.conflictCheck}
              label="I've run a conflict check and found no conflicts"
              required
              errorMessage={errorFor('conflictCheck')}
              checked={values.conflictCheck}
              onCheckedChange={(checked) => set('conflictCheck', checked)}
            />
          </FormSection>
          <FormFooter>
            <Button prominence="tertiary" onClick={reset}>
              Cancel
            </Button>
            <Button prominence="primary" type="submit" isLoading={saving}>
              Create matter
            </Button>
          </FormFooter>
        </Form>
      </>
    );
  },
};

/** Docket numbers look like MER-P-2026-0417 here: county, court, year, number. */
const checkDocket = (value: string) =>
  /^[A-Z]{3}-[A-Z]-\d{4}-\d{4}$/.test(value.trim()) ? undefined : 'Enter it as it appears on the court notice, such as MER-P-2026-0417.';

/**
 * One value changed where it's shown, and a setting that applies as soon as it's flipped: no form.
 * The docket number is checked with Inline Edit's `validate`: a draft in the wrong format stays in
 * the field with its error.
 */
export const OutsideAForm: Story = {
  render: function Render() {
    const [matterName, setMatterName] = React.useState('Lee Living Trust');
    const [caseNumber, setCaseNumber] = React.useState('MER-P-2026-0417');
    const [notify, setNotify] = React.useState(true);
    const [savingNotify, setSavingNotify] = React.useState(false);
    const flip = (next: boolean) => {
      setSavingNotify(true);
      window.setTimeout(() => {
        setNotify(next);
        setSavingNotify(false);
      }, 1200);
    };
    return (
      <div className={styles.stack}>
        <KeyValueList className={styles.details}>
          <KeyValuePair label="Matter name" underline>
            <InlineEdit value={matterName} onConfirm={setMatterName} actionPlacement="end" confirmLabel="Save matter name">
              <TextField context="inline" aria-label="Matter name" />
            </InlineEdit>
          </KeyValuePair>
          <KeyValuePair label="Docket number" underline>
            <InlineEdit value={caseNumber} onConfirm={setCaseNumber} validate={checkDocket} actionPlacement="end" confirmLabel="Save docket number">
              <TextField context="inline" aria-label="Docket number" />
            </InlineEdit>
          </KeyValuePair>
          <KeyValuePair label="Client" value="Jordan Lee" />
        </KeyValueList>
        <Switch label="Email the client when the court accepts a filing" checked={notify} isLoading={savingNotify} onCheckedChange={flip} />
      </div>
    );
  },
};
