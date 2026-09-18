# Key Value List Component Spec

## Overview

Key Value List is a thin layout wrapper — a `<dl>` (description list) that stacks Key Value Pair
items vertically. It resets the browser's default `<dl>` margin and uses `display: flex;
flex-direction: column` for a clean vertical stack. Each child Key Value Pair manages its own
padding and optional underline divider, so the list adds no gap or spacing of its own.

## Anatomy

```txt
<dl.root>              <- flex column, margin: 0, padding: 0
  <KeyValuePair />     <- child pairs, each a <div> wrapping <dt>/<dd>
  <KeyValuePair />
  ...
</dl.root>
```

## Public API

```ts
interface KeyValueListProps {
  children: React.ReactNode;
  className?: string;
}
```

## Tokens

| Token | Usage |
|-------|-------|
| (none) | Key Value List uses no tokens directly — it is a pure layout container. Styling is delegated to Key Value Pair children. |

## Accessibility

- A `<dl>` element — screen readers announce the description list structure.
- Children must be Key Value Pair items (or equivalent `<dt>`/`<dd>` structures) for correct
  semantics.

## Tests

```txt
renders a dl element
renders children inside the dl
applies className to the dl
```

## Figma source

- Component: `key-value-list` (node `4882:341496`, file `Components v1.0.0`)
- 2 variants (underlined vs. clean).

## Related components

- **Key Value Pair** — the individual row.
