Use **RadioGroup**. Billing is a single choice from three short options, and all of them can be visible at once. The Radio docs say Checkbox is for independent choices and RadioGroup is for exactly one answer.

```jsx
import { RadioGroup } from '@legacyhq/ui'; // adjust to your package's import path

function MatterBillingField() {
  const [billing, setBilling] = React.useState('hourly');

  return (
    <RadioGroup
      label="Billing method"
      name="billing-method"
      required
      value={billing}
      onValueChange={setBilling}
      options={[
        { value: 'hourly', label: 'Hourly' },
        { value: 'flat-fee', label: 'Flat fee' },
        { value: 'contingency', label: 'Contingency' },
      ]}
    />
  );
}
```

- **Required:** `required` goes on the group, so the `*` appears after the legend. Don't put it on one option.
- **Uncontrolled:** if the form doesn't need the value in state, swap `value` and `onValueChange` for `defaultValue="hourly"`.
- **Layout:** add `orientation="horizontal"` to put the three options in a row.
- **Validation:** on a failed submit, add `invalid` together with an `errorMessage` such as "Choose a billing method." The docs say not to use `invalid` without a message.
- **Import path:** I didn't check the package's export path, so confirm the import line.
