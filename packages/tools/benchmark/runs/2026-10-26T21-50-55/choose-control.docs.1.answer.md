Use **Radio Group** (`RadioGroup`, an atom in `packages/ui/src/components/atoms/radio/`). Billing type is one choice from three fixed options, so radios fit better than a Select or Checkboxes. Three options are few enough to show all at once.

```tsx
import { RadioGroup } from './radio-group';

<RadioGroup
  label="Billing type"
  description="How this matter will be billed to the client."
  name="billingType"
  required
  options={[
    { value: 'hourly', label: 'Hourly' },
    { value: 'flat-fee', label: 'Flat fee' },
    { value: 'contingency', label: 'Contingency' },
  ]}
/>
```

For a controlled field, add `value` and `onValueChange`:

```tsx
const [billing, setBilling] = React.useState<string>();

<RadioGroup
  label="Billing type"
  name="billingType"
  required
  value={billing}
  onValueChange={(next) => setBilling(next)}
  invalid={submitted && !billing}
  errorMessage={submitted && !billing ? 'Choose how this matter is billed.' : undefined}
  options={[
    { value: 'hourly', label: 'Hourly' },
    { value: 'flat-fee', label: 'Flat fee' },
    { value: 'contingency', label: 'Contingency' },
  ]}
/>
```

- **Props:** `label` renders as the fieldset's legend, which names the group for screen readers. `required` makes each radio natively required and shows a `*` after the legend. `invalid` and `errorMessage` should be used together. `orientation="horizontal"` puts the options in a row. The default is vertical.
- **Import path:** I used a relative import. I didn't check how the package exports the component, so adjust the path to match your app.
- **Alternative:** If the list of billing types grows or each option needs its own layout, you can pass `Radio` children instead of `options`. I'd stick with `options` for three simple choices.
