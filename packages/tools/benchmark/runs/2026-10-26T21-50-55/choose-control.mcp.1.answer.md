Use **RadioGroup**, which comes with the `Radio` component (atom, forms, stable). Billing is a single choice from three fixed options, and RadioGroup gives you a native `fieldset`/`legend` with a shared `name`.

```jsx
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
```

`billing` and `setBilling` are state you own, for example `const [billing, setBilling] = useState('')`. For an uncontrolled group, use `defaultValue="hourly"` instead of `value` and `onValueChange`.

- **Required:** set `required` on the group, not on one option. That puts the `*` after the legend. The docs list marking a single option as required as an anti-example.
- **Validation:** if the user submits without choosing, add `invalid` together with an `errorMessage`, such as "Choose a billing method." The docs say not to use `invalid` without a message.
- **Layout:** the default is vertical. Add `orientation="horizontal"` for a row. It wraps instead of overflowing.
- **Not a Checkbox:** Checkbox is for choices where more than one can apply. A matter has one billing method, so Radio fits.
- **Not a Select:** with only three options, showing them all at once is quicker to scan than opening a dropdown.

If you put the group inside the system's `Form` or `Field`, check how those components handle labelling. RadioGroup already renders its own legend, so a `Field` label around it would repeat it.
