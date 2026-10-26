I couldn't create the file. Bash is denied in this session and the Write tool is disabled, so I have no way to save files. I haven't run typecheck or lint on the code below, and nothing is saved to the repo.

I read the Form docs and the Forms and Validation pattern, and the form is built the way they describe. I'd save it as `packages/ui/src/examples/new-contact-form.tsx`. That's a new folder I picked, and you may want it somewhere else.

```tsx
import * as React from 'react';
import { Button } from '../components/atoms/button';
import { Checkbox } from '../components/atoms/checkbox';
import { Field } from '../components/molecules/field';
import { TextField } from '../components/molecules/text-field';
import { Form, FormFooter, FormSection } from '../components/organisms/form';
import { SectionMessage } from '../components/organisms/section-message';

export interface NewContact {
  name: string;
  email: string;
  /** Whether the contact gets updates by email. Saved with the form. */
  emailUpdates: boolean;
}

export interface NewContactFormProps {
  /** Called with the contact once it passes the checks. Return a promise to show the Save button busy while it saves. */
  onSave: (contact: NewContact) => void | Promise<void>;
  /** Called when someone cancels. The Cancel button shows only when this is set. */
  onCancel?: () => void;
}

type FieldKey = 'name' | 'email';
interface FieldError { key: FieldKey; label: string; message: string }

const EMPTY: NewContact = { name: '', email: '', emailUpdates: false };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function check({ name, email }: NewContact): FieldError[] {
  const errors: FieldError[] = [];
  if (!name.trim()) errors.push({ key: 'name', label: 'Name', message: "Enter the contact's name." });
  if (!email.trim()) errors.push({ key: 'email', label: 'Email', message: "Enter the contact's email address." });
  else if (!EMAIL_PATTERN.test(email.trim()))
    errors.push({ key: 'email', label: 'Email', message: 'Enter an email address with an @ and a domain, such as jordan.lee@example.com.' });
  return errors;
}

export function NewContactForm({ onSave, onCancel }: NewContactFormProps) {
  const prefix = React.useId();
  const ids: Record<FieldKey, string> = { name: `${prefix}-name`, email: `${prefix}-email` };
  const [values, setValues] = React.useState<NewContact>(EMPTY);
  const [submitted, setSubmitted] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [summaryErrors, setSummaryErrors] = React.useState<FieldError[]>([]); // frozen at each submit (live region)
  const [saving, setSaving] = React.useState(false);
  const summary = React.useRef<HTMLDivElement>(null);

  const errors = submitted ? check(values) : []; // after a submit, field errors follow the value
  const errorFor = (key: FieldKey) => errors.find((e) => e.key === key)?.message;

  React.useEffect(() => {
    if (attempt > 0) summary.current?.focus();
  }, [attempt]);

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
            value={values.name} onChange={(e) => setValues((c) => ({ ...c, name: e.target.value }))} />
        </Field>
        <Field label="Email" required state={errorFor('email') ? 'error' : 'default'} message={errorFor('email')}>
          <TextField id={ids.email} name="email" type="email" autoComplete="email" invalid={Boolean(errorFor('email'))}
            value={values.email} onChange={(e) => setValues((c) => ({ ...c, email: e.target.value }))} />
        </Field>
        <Checkbox name="emailUpdates" label="Send me updates by email"
          checked={values.emailUpdates} onCheckedChange={(checked) => setValues((c) => ({ ...c, emailUpdates: checked }))} />
      </FormSection>
      <FormFooter>
        {onCancel ? <Button prominence="tertiary" onClick={onCancel}>Cancel</Button> : null}
        <Button prominence="primary" type="submit" isLoading={saving}>Save</Button>
      </FormFooter>
    </Form>
  );
}
```

How it follows the docs:
- **Yes/no choice:** the pattern's rule is that a choice saved with the form is a **Checkbox**, and a Switch takes effect immediately and doesn't belong in a form with a submit button. So it's a single Checkbox.
- **Checking on submit:** the form sets `noValidate` so the browser's own messages don't come first. It checks only on submit, not while someone types.
- **Error summary:** a failed submit shows every error at once in a `SectionMessage tone="error"`. Each entry links to its field. Focus moves to the summary. The summary only updates on the next submit.
- **Field errors:** each field then shows its own error through `Field state="error"` plus the control's `invalid`. Those errors clear as soon as the value is fixed.
- **Error wording:** messages say what to do, such as "Enter the contact's name."
- **Required fields:** they use `required` and `requiredLegend`.
- **Save button:** it has `type="submit"`, because Button defaults to `type="button"`. It uses `isLoading` while saving, not a disabled button or a swapped label.

To finish it, I'd need to save the file, add a `NewContactForm.stories.tsx` and test, and run `npm run validate`. If you re-enable Write or Bash, or tell me where you want it, I'll do that.
