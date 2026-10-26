I couldn't save the form to the repo because the Write tool is disabled in this session, so nothing has been created or run. Here is the finished component. Save it as `packages/ui/src/examples/new-contact-form.tsx`, or anywhere under `packages/ui/src`, and adjust the import paths to match.

```tsx
import * as React from 'react';
import { Button } from '../components/atoms/button';
import { Checkbox } from '../components/atoms/checkbox';
import { Field } from '../components/molecules/field';
import { TextField } from '../components/molecules/text-field';
import { Form, FormFooter, FormSection } from '../components/organisms/form';
import { SectionMessage } from '../components/organisms/section-message';

// Follows Patterns / Forms and Validation: check on submit, show every error at once in a summary
// at the top and again at each field, then let each field's error follow its value.

export interface NewContactValues {
  name: string;
  email: string;
  /** Saved with the form, so a Checkbox rather than a Switch. */
  sendUpdates: boolean;
}

export interface NewContactFormProps {
  /** Called with the values once they pass the check. Return a promise to show the Save button busy while it saves. */
  onSave: (values: NewContactValues) => void | Promise<void>;
}

type FieldKey = 'name' | 'email';
type FieldError = { key: FieldKey; label: string; message: string };

const EMPTY: NewContactValues = { name: '', email: '', sendUpdates: false };

/** Your own check, run on submit: one entry per field that needs fixing, in the order of the form. */
function check(values: NewContactValues): FieldError[] {
  const email = values.email.trim();
  const failing: Array<[boolean, FieldError]> = [
    [!values.name.trim(), { key: 'name', label: 'Name', message: "Enter the contact's name." }],
    [!email, { key: 'email', label: 'Email', message: "Enter the contact's email address, such as jordan.lee@example.com." }],
    [
      Boolean(email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      { key: 'email', label: 'Email', message: 'Enter an email address in the form name@example.com.' },
    ],
  ];
  const errors = failing.filter(([fails]) => fails).map(([, error]) => error);
  // One error per field: the empty check wins over the format check.
  return errors.filter((error, index) => errors.findIndex((other) => other.key === error.key) === index);
}

export function NewContactForm({ onSave }: NewContactFormProps) {
  const prefix = React.useId();
  const ids: Record<FieldKey, string> = { name: `${prefix}-name`, email: `${prefix}-email` };
  const [values, setValues] = React.useState<NewContactValues>(EMPTY);
  const [submitted, setSubmitted] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  // What the summary lists: the errors as of the last submit. It's a live region, so it doesn't
  // change while people type; the fields do.
  const [summaryErrors, setSummaryErrors] = React.useState<FieldError[]>([]);
  const [saving, setSaving] = React.useState(false);
  const summary = React.useRef<HTMLDivElement>(null);

  const errors = submitted ? check(values) : [];
  const errorFor = (key: FieldKey) => errors.find((error) => error.key === key)?.message;
  const set = <K extends keyof NewContactValues>(key: K, value: NewContactValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  // Move focus to the summary after each failed submit, so it's read out and people start there.
  React.useEffect(() => {
    if (attempt > 0) summary.current?.focus();
  }, [attempt]);

  const submit = async (event: React.FormEvent) => {
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
    try {
      await onSave({ ...values, name: values.name.trim(), email: values.email.trim() });
      setValues(EMPTY);
      setSubmitted(false);
      setAttempt(0);
      setSummaryErrors([]);
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
          <TextField
            id={ids.name}
            name="name"
            autoComplete="name"
            invalid={Boolean(errorFor('name'))}
            value={values.name}
            onChange={(event) => set('name', event.target.value)}
          />
        </Field>
        <Field label="Email" required state={errorFor('email') ? 'error' : 'default'} message={errorFor('email')}>
          <TextField
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errorFor('email'))}
            value={values.email}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>
        <Checkbox
          name="sendUpdates"
          label="Send me updates by email"
          checked={values.sendUpdates}
          onCheckedChange={(checked) => set('sendUpdates', checked)}
        />
      </FormSection>
      <FormFooter>
        <Button prominence="primary" type="submit" isLoading={saving}>
          Save
        </Button>
      </FormFooter>
    </Form>
  );
}
```

I based it on the SubmitAndValidate story in `forms-and-validation.stories.tsx`, plus the Form, Field, Checkbox and Section Message docs.

- **Layout:** `Form` has `requiredLegend` and `noValidate`, so the system's errors show instead of the browser's. A `FormSection` holds the fields, and a `FormFooter` holds the Save button, which has `type="submit"`. The doc says `Button` defaults to `type="button"`.
- **Updates choice:** "Send me updates by email" is a `Checkbox`, not a `Switch`, because a choice saved on submit is a Checkbox. The Switch docs list a Switch inside a submit form as an anti-pattern. It's optional, so it carries no `required` or error.
- **When errors show:** the check runs on submit, not while typing. After a failed submit, each field's error follows its value and clears as soon as it's fixed.
- **Where errors show:**
  - A `SectionMessage` with `tone="error"` sits at the top and lists every failing field in form order, each linking to its field.
  - Each field also shows its own message through `Field` `state="error"`, with `invalid` on the `TextField`.
  - Focus moves to the summary after each failed submit, because no component does that for you.
  - The summary only updates on submit, since it's a live region.
- **Error wording:** each message says what to do. Email gets a separate message for empty versus badly formatted.
- **Busy state:** Save uses `isLoading` while `onSave` is pending. It isn't disabled, and its label doesn't change to "Saving…".

I didn't add a Cancel button because you only asked for Save. I didn't add a story or test either; the repo's patterns suggest a `.stories.tsx` and a test beside the component. If you re-enable file writes or Bash, I can save it, run `npm run validate`, and add those.
