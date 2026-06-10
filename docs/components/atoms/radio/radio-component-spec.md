# Radio Component Spec

## Component Overview

Radio allows a user to select one option from a set of mutually exclusive options. Radio should almost always be used inside RadioGroup so the available choices are clearly related and accessible.

This component includes two public exports:

- `Radio`
- `RadioGroup`

The Figma `radio-item` part should be documented as component anatomy only and should not be exported as a public React component unless required later.

## Folder Location

```txt
packages/ui/src/components/atoms/radio/
```

## Required Files

```txt
radio.tsx
radio-group.tsx
radio.types.ts
radio.module.css
radio.test.tsx
radio.stories.tsx
index.ts
```

## Anatomy

### Radio

```txt
Radio root
├─ Native input[type="radio"]
├─ Visual indicator
│  ├─ unchecked visual
│  └─ checked visual
└─ Label text
   └─ Optional required indicator for standalone radio
```

### RadioGroup

```txt
RadioGroup root / fieldset
├─ Legend / group label
│  └─ Optional required indicator
├─ Optional description
├─ Options
│  ├─ Radio
│  ├─ Radio
│  └─ Radio
└─ Optional error message
```

## Public API

### Radio Props

```ts
export interface RadioProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'checked' | 'defaultChecked'
  > {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  onCheckedChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
```

### RadioGroup Option

```ts
export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}
```

### RadioGroup Props

```ts
export interface RadioGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  options?: RadioGroupOption[];
  children?: React.ReactNode;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  onValueChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
```

## Defaults

### Radio

```ts
invalid = false
disabled = false
required = false
```

### RadioGroup

```ts
orientation = 'vertical'
required = false
invalid = false
disabled = false
```

RadioGroup default spacing should be vertical with no visible gap between radio options unless design tokens specify otherwise.

## Usage Examples

### Radio

```tsx
<Radio label="Label" name="example" value="option-1" />
```

### Controlled RadioGroup

```tsx
<RadioGroup
  label="Choose one"
  name="example"
  value={value}
  onValueChange={setValue}
  options={[
    { value: 'one', label: 'Option one' },
    { value: 'two', label: 'Option two' },
    { value: 'three', label: 'Option three' },
  ]}
/>
```

### Uncontrolled RadioGroup

```tsx
<RadioGroup
  label="Choose one"
  name="example"
  defaultValue="one"
  options={[
    { value: 'one', label: 'Option one' },
    { value: 'two', label: 'Option two' },
    { value: 'three', label: 'Option three' },
  ]}
/>
```

### Label-less Radio

```tsx
<Radio aria-label="Select row" name="row-selection" value="row-1" />
```

## Visual Requirements

### Radio Indicator

- Visual indicator size: 16px by 16px.
- Interaction target: 24px by 24px.
- The 16px indicator should be centered inside the 24px target.
- Draw checked and unchecked states with private CSS indicator anatomy.
- Do not add radio control shapes to the shared icon library.
- Do not use the browser default checkbox/radio appearance.
- Do not use SVG as the actual input.

### Label

- Typography: `body-md`.
- Required mark appears after the label text.
- Required mark uses error content color.
- Disabled label uses disabled content color.

### Focus

- Use Focus Ring primitive utility classes.
- Do not recreate focus ring styles locally.
- Focus should appear around the 24px interaction target / visual indicator area.
- Use `:focus-visible` behavior through the Focus Ring primitive.

## Token Mapping

Use semantic CSS variables only. Do not hardcode visual design values unless a token does not exist and the implementation documents the gap.

### Size

- Indicator size: token equivalent of 16px.
- Interaction target: token equivalent of 24px.
- Label gap: token equivalent of 8px or closest existing component spacing from the spec.
- RadioGroup option gap: 0.

### Typography

- Label: `body-md` typography token set.

### Color Tokens

Use these semantic token concepts:

- default content: `--color-content-default` or current project equivalent
- disabled content: `--color-content-disabled` or current project equivalent
- input background default: `--color-background-input-default`
- input background hovered: `--color-background-input-hovered`
- input background pressed: `--color-background-input-pressed`
- selected bold background: `--color-background-selected-bold-default`
- inverse content: `--color-content-inverse`
- input border: `--color-border-input`
- focused border/ring: `--color-border-focused`
- error border: `--color-border-error`
- disabled border: `--color-border-disabled`
- disabled background: `--color-background-disabled`

If the local token system uses `--color-text-*` instead of `--color-content-*`, follow the generated token files and document any naming mismatch.

## State Styling

### Unchecked

- background: input background default
- indicator stroke: input border
- no fill mark

### Hover

- background: input background hovered

### Pressed

- background: input background pressed

### Checked

- outer selected shape/fill: selected bold background
- inner mark/dot: inverse content
- no visible border unless required by implementation asset

### Focus

- consume Focus Ring utility classes
- focused visual should use focused border/ring token

### Invalid Unchecked

- background: input background default
- outer stroke: error border

### Invalid Checked

- invalid outer treatment uses error border/accent
- selected fill remains visible
- inner dot remains inverse content

### Disabled Unchecked

- background: disabled background
- border/stroke: disabled border
- label: disabled content

### Disabled Checked

- preserve selected structure where possible
- use disabled tokens to communicate unavailable state
- label: disabled content

## Behavior

### Radio

- Native input remains the semantic and form element.
- Visual indicator is decorative.
- `onCheckedChange` fires when the input changes.
- `checked` enables controlled usage.
- `defaultChecked` enables uncontrolled usage.
- Label click toggles the radio through native label/input association.

### RadioGroup

- Manages a single selected value.
- Passes shared `name` to radios when options are used.
- Controlled with `value` and `onValueChange`.
- Uncontrolled with `defaultValue`.
- Supports `options` API.
- Supports `children` composition for custom layouts.
- Disabled group disables all options generated from `options`.
- Required should apply to the group-level question.

## Accessibility

### Required

- Use native radio inputs.
- Use `<fieldset>` and `<legend>` when RadioGroup has a label.
- RadioGroup label should be the accessible group name.
- If no visible radio label is provided, require `aria-label` or `aria-labelledby`.
- Use `aria-invalid` when invalid.
- Connect error text to the group/input with `aria-describedby`.
- Required indicator should be visual and paired with native `required` where appropriate.
- Do not use `role="radio"` for native radios.
- Do not use SVG-only controls.

### Decorative SVGs

SVG indicators must use:

```tsx
aria-hidden="true"
focusable="false"
```

## Storybook Requirements

Use atom story structure:

```txt
Radio
├─ Playground
├─ Variants
└─ Examples
```

### Playground

Controls for:

- checked/value
- disabled
- invalid
- required
- label

### Variants

Show:

- unchecked
- checked
- invalid unchecked
- invalid checked
- disabled unchecked
- disabled checked
- focus example if possible

### Examples

Show:

- standalone radio
- label-less table radio example
- vertical RadioGroup
- controlled RadioGroup
- uncontrolled RadioGroup
- required RadioGroup
- invalid RadioGroup with error message
- disabled RadioGroup
- dark surface example

## Testing Requirements

Use Vitest and React Testing Library.

### Radio Tests

- renders native radio input
- renders label
- supports checked
- supports defaultChecked
- supports disabled
- supports invalid
- supports required
- supports label-less radio with aria-label
- calls onCheckedChange
- forwards native input props
- applies custom className
- does not render role="radio" manually

### RadioGroup Tests

- renders group label
- renders options
- supports controlled value
- supports defaultValue
- calls onValueChange with selected value
- passes shared name to options
- supports required group
- supports invalid group
- associates error message with group
- supports disabled group
- supports children composition

## Engineering Requirements

- React
- TypeScript
- CSS Modules
- No MUI
- No Tailwind
- No hardcoded colors
- No hardcoded typography
- No hardcoded spacing unless documented as missing token
- Use CSS variables and semantic tokens
- Use Focus Ring primitive utilities
- Export Radio and RadioGroup from `index.ts`

## QA Checklist

- Radio compiles.
- RadioGroup compiles.
- Storybook compiles.
- Tests compile and pass.
- Native form submission works.
- Keyboard interaction works.
- Focus ring appears consistently.
- Checked, unchecked, disabled, and invalid states match Figma intent.
- Light theme works.
- Dark theme works.
- No MUI imports.
- No Tailwind utilities.
- No SVG-only interactive controls.
