# Key Value Pair

Key Value Pair maps a descriptive label (key) to a static or inline-editable value for scannable
metadata presentation. It renders semantic `<dt>`/`<dd>` elements inside a horizontal row, with the
key taking a fixed 40% width and the value filling the rest.

## When to use

- Displaying metadata as label/value rows — client name, account type, status, dates.
- Inline-editable fields: pass a TextField, TextArea, or Select with `appearance="inline"` as
  children, paired with an `iconAfter` edit icon for the inline-edit affordance.

## When not to use

- **A full form layout.** Use the Form organism with Field molecules — Key Value Pair is for
  compact metadata display, not form building.
- **A data table.** If metadata has many rows with sortable/filterable columns, a table is more
  appropriate.

## Sizes

Three sizes (`sm`, `md`, `lg`) control padding-block and typography:

| Size | Padding block | Typography |
|------|--------------|------------|
| sm | `--spacing-xs` | body-sm |
| md (default) | `--spacing-sm` | body-md |
| lg | `--spacing-md` | body-lg |

## Static vs. editable

Pass a plain `value` string for read-only display. For inline editing, provide children — a
TextField or TextArea with `appearance="inline"` and an `iconAfter` edit icon. Children take
precedence over `value` when both are provided.

## Underline

Set `underline` to add a 1px bottom border between pairs. The last item in a list typically omits
it to avoid a double-border with the list's edge.

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | (required) | The key label displayed in the left column. |
| `value` | `React.ReactNode` | - | Static value text. Ignored when `children` is provided. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls padding and typography. |
| `underline` | `boolean` | `false` | Adds a bottom border divider. |
| `className` | `string` | - | Composes with the root element's class list. |
| `children` | `React.ReactNode` | - | Inline-editable control (TextField/TextArea/Select with `appearance="inline"`). Takes precedence over `value`. |

## Accessibility

- Renders `<dt>` for the key and `<dd>` for the value — semantically meaningful inside a `<dl>`.
- Wrap in a Key Value List (`<dl>`) for screen readers to announce the list structure.
- Inline-editable children are responsible for their own accessible name (via `aria-label`).

## Related components

- **Key Value List** — wraps pairs in a `<dl>`.
- **Text Field** — `appearance="inline"` for single-line inline editing inside a pair.
- **Text Area** — `appearance="inline"` for multi-line inline editing inside a pair.
- **Field** — for full form layouts with labels, validation, and helper text.
