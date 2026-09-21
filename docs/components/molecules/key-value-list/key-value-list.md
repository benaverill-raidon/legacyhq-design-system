# Key Value List

Key Value List is a thin layout wrapper that stacks Key Value Pair items vertically inside a
semantic `<dl>` element. It provides the description list structure that screen readers need to
announce key/value pairs correctly.

## When to use

- Wrapping multiple Key Value Pair items into a single description list.
- Any metadata panel, detail sidebar, or settings overview with label/value rows.

## When not to use

- **A single isolated key/value pair.** You can use Key Value Pair alone, but wrap it in a `<dl>`
  yourself for correct semantics.
- **A data table.** If the data has sortable/filterable columns, use a table.

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | (required) | Key Value Pair children. |
| `className` | `string` | - | Composes with the `<dl>` element's class list. |

## Accessibility

- Renders a `<dl>` element — screen readers announce the description list structure.
- Each child Key Value Pair provides the `<dt>`/`<dd>` semantics.

## Related components

- **Key Value Pair** — the individual row this list wraps.
- **Text Field** / **Text Area** — `appearance="inline"` for inline editing inside pairs.
