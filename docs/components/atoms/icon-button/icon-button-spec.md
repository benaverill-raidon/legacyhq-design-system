# Icon Button Component Spec

## Overview

Icon Button is an icon-only button used for common, recognizable actions where space is limited.

It belongs to the Button family and reuses Button foundations for sizing, appearance logic, focus behavior, disabled behavior, loading behavior, and token conventions.

## Anatomy

```txt
IconButton
+- button root
|  +- icon slot / children
|  +- spinner, loading only
+- optional internal Tooltip wrapper
+- focus ring
```

## Public API

```ts
type IconButtonAppearance = 'default' | 'primary' | 'subtle';
type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type IconButtonShape = 'square' | 'round';

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  appearance?: IconButtonAppearance;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  isDisabled?: boolean;
  isLoading?: boolean;
  isExpanded?: boolean;
  tooltip?: React.ReactNode | false;
  tooltipPlacement?: TooltipPlacement;
  children: React.ReactNode;
}
```

## Accessible name

Every Icon Button must have an accessible name.

Preferred:

```tsx
<IconButton aria-label="Edit">
  <EditIcon />
</IconButton>
```

Alternative:

```tsx
<span id="edit-button-label">Edit</span>
<IconButton aria-labelledby="edit-button-label" tooltip="Edit">
  <EditIcon />
</IconButton>
```

Tooltip content must never replace the control's accessible name.

## Tooltip behavior

Icon Button composes Tooltip internally as a convenience layer when it has enough information to do so safely.

Supported patterns:

```tsx
<IconButton aria-label="Edit">
  <EditIcon />
</IconButton>
```

This uses `aria-label` as the default tooltip content.

```tsx
<IconButton aria-label="Edit" tooltip="Edit record details">
  <EditIcon />
</IconButton>
```

This uses explicit tooltip content.

```tsx
<Tooltip content="Custom explanation">
  <IconButton aria-label="Edit" tooltip={false}>
    <EditIcon />
  </IconButton>
</Tooltip>
```

Use `tooltip={false}` when external Tooltip composition intentionally owns the visible tooltip message.

If `aria-labelledby` is used, provide `tooltip` explicitly or set `tooltip={false}`.

## Tooltip rules

```txt
tooltip omitted + aria-label string -> use aria-label as tooltip content
tooltip explicit React node -> use explicit tooltip content
tooltip={false} -> do not render Tooltip
aria-labelledby only -> do not infer tooltip text from the DOM
```

## Disabled behavior

When `isDisabled` is true:

- render a natively disabled button
- suppress click behavior
- preserve disabled semantics
- allow pointer-triggered tooltip explanation through Tooltip's non-focusable wrapper behavior
- do not imply keyboard interactivity

## Loading behavior

When `isLoading` is true:

- replace icon content with Spinner
- preserve fixed square dimensions
- set `aria-busy="true"`
- prevent click interaction
- keep the native button element enabled unless the current loading pattern explicitly requires `disabled`

## Expanded behavior

When `isExpanded` is true:

```tsx
aria-expanded={true}
```

Use for menu/disclosure triggers. Do not use `aria-pressed` for expanded state.

## Focus and refs

- Use the shared Focus Ring utility.
- Forward the ref to the native `button`, even when Tooltip is composed internally.

## Storybook

Keep the documentation structure:

```txt
Icon Button / Playground
Icon Button / Variants
Icon Button / Examples
```

Examples should cover:

- default tooltip inherited from `aria-label`
- explicit custom tooltip content
- `tooltip={false}`
- `aria-labelledby` with explicit tooltip
- disabled tooltip explanation
- loading behavior
- toolbar usage
- light and dark themes
