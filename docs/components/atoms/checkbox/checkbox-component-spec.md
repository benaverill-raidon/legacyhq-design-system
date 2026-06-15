# Checkbox Component Spec

## Component Overview

Checkbox is a form input atom used to let users select one or more independent options. It uses a native checkbox input for accessibility and form behavior while rendering a custom visual indicator aligned to the design system.

## Component Type

- Name: `Checkbox`
- Category: Atom
- Folder: `packages/ui/src/components/atoms/checkbox/`
- Public export: Yes
- Interactive: Yes
- Native element: `<input type="checkbox">`

## Anatomy

```txt
Checkbox
├─ Root label/wrapper
│  ├─ Hidden native input
│  ├─ Visual indicator
│  │  ├─ Check icon or indeterminate mark
│  │  └─ Focus ring target
│  └─ Label text
│     └─ Required indicator, when required
```

## Figma Anatomy Note

The Figma design includes a `checkbox-item` part used to assemble checkbox states and component variants. In React, this should be treated as internal implementation anatomy, not as a separately exported public component.

## Variants

### State

Supported visual states:

- `default`
- `hover`
- `press`
- `focus`

State should generally be handled through CSS pseudo-classes and input state rather than a public `state` prop.

### Checked State

- `checked: false`
- `checked: true`

### Indeterminate State

- `indeterminate: false`
- `indeterminate: true`

When `checked` and `indeterminate` are both true, indeterminate wins visually.

### Invalid State

- `invalid: false`
- `invalid: true`

### Disabled State

- `disabled: false`
- `disabled: true`

### Required State

- `required: false`
- `required: true`

Required state displays an asterisk after the label when a visible label is present.

## Props / API

```ts
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheckedChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  className?: string;
}
```

## Default Props

```ts
indeterminate = false
invalid = false
disabled = false
required = false
```

## Usage Examples

```tsx
<Checkbox label="Label" />
```

```tsx
<Checkbox label="Label" required />
```

```tsx
<Checkbox checked={checked} onCheckedChange={setChecked} label="Send updates" />
```

```tsx
<Checkbox indeterminate label="Select all" />
```

```tsx
<Checkbox aria-label="Select row" />
```

## Design Tokens

Use CSS variables only. Do not use hardcoded colors, spacing, typography, or border values when equivalent tokens exist.

### Size

- Indicator size: `16px`, use a component token if available or document as missing.
- Interaction target: minimum `24px`, use spacing/component sizing token if available or document as missing.
- Label gap: use semantic spacing token.
- Label typography: `body-md`.

### Color Intent

Use available semantic tokens for:

- Default border
- Bold/selected background
- Inverse content/icon
- Disabled background
- Disabled content
- Invalid/error border
- Focus ring color from Focus Ring primitive

Recommended mappings, subject to available token names:

- Unchecked border: `--color-border-bold` or closest available border token
- Checked background: selected/bold background token
- Checked icon: inverse content token
- Indeterminate background: same as checked background
- Indeterminate icon: same as checked icon
- Invalid border: `--color-border-error`
- Disabled background: `--color-background-disabled`
- Disabled content: `--color-content-disabled` or equivalent text/content token
- Label text: `--color-content-default` or equivalent text token
- Required indicator: `--color-content-error` or equivalent text token

## Styling Requirements

- Root should be inline-flex.
- Root should align items center.
- Native input should remain accessible while visually hidden.
- Visual indicator should be 16px square.
- Interaction target should be at least 24px.
- Indicator should use tokenized border radius.
- Indicator should use tokenized border width.
- Indicator should use tokenized colors.
- Label should use `body-md` typography.
- Required indicator appears after label.
- Use Focus Ring primitive utility classes for focus-visible styling.
- Do not use MUI.
- Do not use Tailwind.

## Behavior

- Clicking the visible label toggles the input.
- Space toggles the input when focused.
- Disabled prevents interaction.
- Controlled usage is supported through `checked`.
- Uncontrolled usage is supported through `defaultChecked`.
- `onCheckedChange` fires with the next checked value and native change event.
- `indeterminate` sets the native input `indeterminate` property via ref/effect.
- `indeterminate` visually overrides checked.

## Accessibility

- Must use native checkbox input.
- Must preserve form submission behavior.
- Must support `name`, `value`, `checked`, `defaultChecked`, `disabled`, and `required`.
- Must support `aria-label` and `aria-labelledby` for label-less usage.
- If no `label`, `aria-label`, or `aria-labelledby` is provided, this should be considered invalid usage and may warn in development.
- Use `aria-invalid` when `invalid` is true.
- Use `aria-checked="mixed"` when indeterminate, if applicable.
- Do not add extra roles unless required.

## Storybook Requirements

Storybook stories are documentation pages, not one story per variant.

Use atom structure:

```txt
Checkbox
├─ Playground
├─ Variants
└─ Examples
```

### Stories

- Playground
- Variants
  - unchecked
  - checked
  - indeterminate
  - invalid
  - disabled
  - required
  - focused example
- Examples
  - Basic form option
  - Required option
  - Table row selection without visible label
  - Select all / indeterminate parent checkbox

## Testing Requirements

Use Vitest and React Testing Library.

Test:

- Renders with label.
- Renders without visible label when `aria-label` is provided.
- Toggles uncontrolled checkbox.
- Supports controlled checked state.
- Calls `onCheckedChange` with boolean and event.
- Applies indeterminate state.
- Indeterminate visually overrides checked.
- Applies invalid state and `aria-invalid`.
- Applies disabled state and prevents interaction.
- Applies required state.
- Supports custom `className`.
- Forwards native input attributes such as `name` and `value`.
- Uses native checkbox role.

## Engineering Requirements

Create:

```txt
packages/ui/src/components/atoms/checkbox/
├── checkbox.tsx
├── checkbox.types.ts
├── checkbox.module.css
├── checkbox.test.tsx
├── checkbox.stories.tsx
└── index.ts
```

## QA Checklist

- Keyboard interaction works with Space.
- Label click toggles input.
- Focus ring appears only on keyboard focus / focus-visible.
- Checked, unchecked, and indeterminate states are visually distinct.
- Disabled state is visually muted and non-interactive.
- Invalid state is visible.
- Required marker appears after label.
- Label-less usage works with accessible name.
- Light and dark themes work.
- No hardcoded design values when tokens exist.
- No MUI dependency.
- No Tailwind dependency.
