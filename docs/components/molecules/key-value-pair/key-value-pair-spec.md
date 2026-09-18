# Key Value Pair Component Spec

## Overview

Key Value Pair presents a label (key) and its associated value in a horizontal row for scannable
metadata. The key occupies a fixed 40% width; the value fills the remaining space. The value slot
accepts either a plain `value` prop (static text) or `children` (an inline-editable control like
TextField/TextArea/Select with `appearance="inline"`).

## Anatomy

```txt
<div.root>        <- flex row, align-items: flex-start; data-size attribute
  <dt.key>        <- label text, fixed 40% width, content/subtle color
  <dd.value>      <- value text or inline-editable children, flex: 1 1 auto
</div.root>
```

When `underline` is true, the root gets a 1px bottom border (`border/default`).

For editable multiline values, use `TextArea autoResize size={size} appearance="inline"` inside
`InlineEdit actionPlacement="end" actionAlignment="start"`. The minimum field height matches
TextField's `--size-control-sm/md/lg` token. Content grows the field and row in normal flow up to
six lines (`maxRows={6}`), then scrolls vertically. Following rows move down; the key and external
actions stay at the top. Actions are centered within the first minimum control-height band
(sm/md/lg), independent of the textarea's expanded height. The textarea's trailing icon slot is
24 × 24px. Reserve space outside the trailing edge for the action buttons.
Enter inserts a newline, Ctrl/Cmd+Enter confirms, and Escape cancels and restores the saved height.

## Public API

```ts
type KeyValuePairSize = 'sm' | 'md' | 'lg';

interface KeyValuePairProps {
  label: string;
  value?: React.ReactNode;
  size?: KeyValuePairSize;
  underline?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

`children` takes precedence over `value` when both are provided.

## Defaults

```txt
size: md
underline: false
```

## Geometry

| Size | Padding block | Gap | Key typography | Value typography |
|------|--------------|-----|----------------|------------------|
| sm | `0` | `--spacing-lg` | body-sm | body-sm |
| md | `0` | `--spacing-lg` | body-md | body-md |
| lg | `0` | `--spacing-lg` | body-lg | body-lg |

Key width is always 40% (`inline-size: 40%`). The gap between key and value is `--spacing-lg` at
all sizes. Rows have no block padding. Inline TextField, TextArea, and Select frames have square
corners within the value slot.

## Tokens

| Token | Usage |
|-------|-------|
| `--color-content-subtle` | Key text color |
| `--color-content-default` | Value text color |
| `--color-border-default` | Underline border color |
| `--border-width-sm` | Underline border width |
| `--spacing-sm` / `--spacing-md` | Inline-start padding for keys and static values |
| `--spacing-lg` | Gap between key and value |
| `--typography-body-sm-*` / `body-md-*` / `body-lg-*` | Typography per size |

## Accessibility

- `<dt>` for the key and `<dd>` for the value — standard description list semantics.
- Should be wrapped in a Key Value List (`<dl>`) for the structure to be announced correctly.
- When children are an inline-editable control, that control is responsible for its own accessible
  name (via `aria-label`).

## Tests

```txt
renders a dt for the key and a dd for the value
applies the default size (md) when no size is specified
applies the specified size class and data-size attribute
renders an underline border when underline is true
renders children instead of value when both are provided
applies className to the root element
renders correctly at each size (sm, md, lg)
renders plain value text in the dd
renders without underline by default
```

## Figma source

- Component: `key-value-pair` (node `4869:244271`, file `Components v1.0.0`)
- 22 variants across size (sm, md, lg), context (default, inline), and underline axes.
- The `context=inline` variant maps to embedding a TextField/TextArea with `appearance="inline"`.

## Related components

- **Key Value List** — `<dl>` wrapper for multiple pairs.
- **Text Field** — `appearance="inline"` for single-line inline editing.
- **Text Area** — `appearance="inline"` for multi-line inline editing.
