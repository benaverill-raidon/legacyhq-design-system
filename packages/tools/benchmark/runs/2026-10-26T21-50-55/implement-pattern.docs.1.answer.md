I couldn't create the file: the Write tool is disabled in this session, and Read, Grep and Glob can't write. Nothing in the repo has changed, and I haven't run typecheck, lint or tests on this code. Below is the component and where I'd put it.

**Suggested path:** `packages/ui/src/examples/new-contact-form.tsx`. That folder doesn't exist yet. I haven't checked whether `npm test` or the taxonomy tests would pick it up, so I'd run `npm run validate` after adding it. If you'd rather keep it in Storybook, it could instead become a story under `storybook/pages/`.

```tsx
import * as React from 'react';
import { Button } from '../components/atoms/button';
import { Checkbox } from '../components/atoms/checkbox';
import { Field } from '../components/molecules/field';
import { TextField } from '../components/molecules/text-field';
import { Form, FormFooter, FormSection } from '../components/organisms/form';
import { SectionMessage } from '../components/organisms/section-message';

export interface NewContactValues {
  name: string;
  email: string;
  emailUpdates: boolean;
}

export interface NewContactFormProps {
  onSave: (values: NewContactValues) => Promise<void> | void;
  onCancel?: () => void;
}

type FieldKey = 'name' | 'email';
type FieldError = { key: FieldKey; label: string; message: string };

const EMPTY: NewContactValues = { name: '', email: '', emailUpdates: false };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function check(values: NewContactValues): FieldError[] {
  const email = values.email.trim();
  const failing: Array<[boolean, FieldError]> = [
    [!values.name.trim(), { key: 'name', label: 'Name', message: "Enter the contact's name." }],
    [!email, { key: 'email', label: 'Email', message: "Enter the contact's email address, such as jordan.lee@example.com." }],
    [Boolean(email) && !EMAIL_PATTERN.test(email), { key: 'email', label: 'Email', message: 'Enter an email address with an @ and a domain, such as jordan.lee@example.com.' }],
  ];
  const errors = failing.filter(([fails]) => fails).map(([, e]) => e);
  return errors.filter((e, i) => errors.findIndex((o) => o.key === e.key) === i);
}

export function NewContactForm({ onSave, onCancel }: NewContactFormProps) {
  const prefix = React.useId();
  const ids: Record<FieldKey, string> = { name: `${prefix}-name`, email: `${prefix}-email` };
  const [values, setValues] = React.useState<NewContactValues>(EMPTY);
  const [submitted, setSubmitted] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [summaryErrors, setSummaryErrors] = React.useState<FieldError[]>([]);
  const [saving, setSaving] = React.useState(false);
  const summary = React.useRef<HTMLDivElement>(null);

  const errors = submitted ? check(values) : [];
  const errorFor = (key: FieldKey) => errors.find((e) => e.key === key)?.message;
  const set = <K extends keyof NewContactValues>(key: K, value: NewContactValues[K]) =>
    setValues((c) => ({ ...c, [key]: value }));

  React.useEffect(() => {
    if (attempt > 0) summary.current?.focus();
  }, [attempt]);

  const reset = () => { setValues(EMPTY); setSubmitted(false); setAttempt(0); setSummaryErrors([]); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSubmitted(true);
    const failed = check(values);
    setSummaryErrors(failed);
    if (failed.length > 0) { setAttempt((n) => n + 1); return; }
    setSaving(true);
    try {
      await onSave({ ...values, name: values.name.trim(), email: values.email.trim() });
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form title="New contact" requiredLegend noValidate onSubmit={submit}>
      {summaryErrors.length > 0 ? (
        <FormSection>
          <SectionMessage
            ref={summary}
            tabIndex={-1}
            tone="error"
            title={`Fix ${summaryErrors.length === 1 ? '1 field' : `${summaryErrors.length} fields`} to save the contact`}
            errors={summaryErrors.map(({ key, label, message }) => ({ label, message, targetId: ids[key] }))}
          />
        </FormSection>
      ) : null}
      <FormSection>
        <Field label="Name" required state={errorFor('name') ? 'error' : 'default'} message={errorFor('name')}>
          <TextField id={ids.name} name="name" autoComplete="name" invalid={Boolean(errorFor('name'))}
            value={values.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Email" required state={errorFor('email') ? 'error' : 'default'} message={errorFor('email')}>
          <TextField id={ids.email} name="email" type="email" autoComplete="email" invalid={Boolean(errorFor('email'))}
            value={values.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Checkbox name="emailUpdates" label="Send me updates by email"
          checked={values.emailUpdates} onCheckedChange={(checked) => set('emailUpdates', checked)} />
      </FormSection>
      <FormFooter>
        {onCancel ? (
          <Button prominence="tertiary" onClick={() => { reset(); onCancel(); }}>Cancel</Button>
        ) : null}
        <Button prominence="primary" type="submit" isLoading={saving}>Save</Button>
      </FormFooter>
    </Form>
  );
}
```

**How it follows the docs** (Patterns / Forms and Validation, Form):
- **Yes/no choice:** It's a single **Checkbox**, not a Switch. The pattern says a choice saved on submit is a Checkbox, and a Switch means the change has already happened. It isn't required, so it's `false` unless someone checks it.
- **Required fields:** Name and Email use `Field required`, and the form sets `requiredLegend` so the `*` is explained.
- **`noValidate`:** It's set so the browser's own messages don't come before the system's.
- **When errors show:** Checks run on submit, not while typing. After a failed submit, each field's error follows its value and clears as soon as it's fixed.
- **Failed submit:** An error `SectionMessage` sits at the top, and each field shows its own error as well. Each summary entry links to its field, and focus moves to the summary because no component does that for you. The summary only changes on the next submit.
- **Error wording:** Messages say what to do, for example "Enter the contact's name."
- **Save button:** It has `type="submit"` and uses `isLoading` while saving, so it keeps its size and label and isn't disabled.

I made two choices you may want to change. The email check is a loose "has an @ and a domain" pattern, with real verification left to the server. And on success the form resets and leaves confirmation to the caller, for example `toast.success(...)` inside `onSave`, as the pattern suggests.

If you re-enable Write, or tell me to put it somewhere else, I'll add the file, add a story and test beside it, and run `npm run validate`.
