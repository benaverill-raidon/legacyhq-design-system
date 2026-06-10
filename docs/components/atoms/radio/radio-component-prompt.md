# Radio Implementation Prompt

Please implement the Radio and RadioGroup components using this prompt, the component spec, the checklist, Figma screenshots, and generated token CSS files.

## Source Priority

1. `radio-component-spec.md`
2. `radio-component-prompt.md`
3. Figma screenshots
4. `radio-component-checklist.md`
5. Token files

If anything conflicts, follow the higher-priority source.

## Goal

Create production-ready Radio and RadioGroup components for the internal React component library.

Radio should be a native-input-based atom. RadioGroup should provide grouped single-selection behavior for forms and settings.

## Folder Structure

Create:

```txt
packages/ui/src/components/atoms/radio/
├── radio.tsx
├── radio-group.tsx
├── radio.types.ts
├── radio.module.css
├── radio.test.tsx
├── radio.stories.tsx
└── index.ts
```

## Public Exports

Export:

```ts
export { Radio } from './radio';
export { RadioGroup } from './radio-group';
export type { RadioProps, RadioGroupProps, RadioGroupOption } from './radio.types';
```

Do not export a public `RadioItem` component.

The Figma `radio-item` is an anatomy/helper part only.

## Implementation Requirements

### Radio

Use a native radio input:

```tsx
<input type="radio" />
```

The native input must remain:

- focusable
- keyboard accessible
- form compatible
- label associated
- screen reader accessible

Do not implement radio behavior using only `div`, `button`, or SVG.

### Visual Indicator

Use decorative visual indicators for unchecked and checked states.

Draw the visual radio indicator with private CSS anatomy.

Do not add `radio-unchecked` or `radio-checked` assets to the shared icon library.

The indicator must not be the interactive control.

### Sizing

- Visual indicator: 16px
- Interaction target: 24px
- Center the 16px indicator inside the 24px target
- Label typography: body-md

Use tokens/CSS variables wherever available.

### States

Support:

- unchecked
- checked
- hover
- pressed
- focus
- invalid
- disabled
- required

Checked state:

- selected bold background
- inverse inner dot
- no border in default checked state unless asset requires it

Invalid checked state:

- red invalid outer treatment
- selected fill remains visible
- inverse inner dot remains visible

Disabled checked state:

- preserve checked structure
- use disabled tokens

## RadioGroup Requirements

Implement RadioGroup in the same folder.

Support controlled and uncontrolled usage:

```tsx
<RadioGroup value={value} onValueChange={setValue} />
<RadioGroup defaultValue="option-1" />
```

Support both options and children composition.

Primary options API:

```tsx
<RadioGroup
  label="Choose one"
  name="example"
  options={[
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
  ]}
/>
```

Default layout:

- vertical
- gap: 0

Use `<fieldset>` and `<legend>` when a group label is provided.

Required indicator should appear after the group label/legend.

## Focus Requirements

Use the existing Focus Ring primitive utility classes.

Do not create a separate focus ring implementation inside Radio.

Consume the existing focus ring classes, likely:

```css
.focusRing
.focusRingDefault
```

or whatever the project already exposes.

Use `:focus-visible` behavior through the Focus Ring primitive.

## Accessibility Requirements

- Native radio input required
- Shared `name` across group options
- `<fieldset>` / `<legend>` for grouped radio questions
- Label click selects the radio
- Keyboard interaction works natively
- If individual visible label is missing, require `aria-label` or `aria-labelledby`
- Use `aria-invalid` for invalid state
- Connect error text using `aria-describedby`
- Do not use manual `role="radio"` with native radio input
- Do not make decorative SVGs focusable

## API Requirements

Use the API defined in `radio-component-spec.md`.

Important props:

Radio:

- `label`
- `checked`
- `defaultChecked`
- `invalid`
- `required`
- `disabled`
- `onCheckedChange`
- `className`
- `inputClassName`

RadioGroup:

- `label`
- `description`
- `errorMessage`
- `name`
- `value`
- `defaultValue`
- `options`
- `children`
- `required`
- `invalid`
- `disabled`
- `orientation`
- `onValueChange`

## Styling Requirements

Use CSS Modules.

Use CSS variables only for design values.

Do not use:

- MUI
- Tailwind
- hardcoded colors
- hardcoded typography values
- hardcoded spacing values unless documented as a missing token

Use semantic tokens for:

- content color
- disabled content
- input background
- input border
- selected bold background
- inverse content
- error border
- disabled border
- disabled background
- focus ring
- body-md typography

If token names differ between generated CSS and the spec, use the generated CSS tokens and document the mismatch.

## Storybook Requirements

Create documentation-style stories.

Use:

```txt
Radio
├─ Playground
├─ Variants
└─ Examples
```

Stories should include:

- Playground
- standalone radio
- unchecked and checked variants
- invalid states
- disabled states
- required example
- label-less table example
- vertical RadioGroup
- controlled RadioGroup
- uncontrolled RadioGroup
- invalid RadioGroup with error message
- disabled RadioGroup
- dark surface example

Do not create one story per state unless necessary.

## Test Requirements

Use Vitest and React Testing Library.

Test Radio:

- renders native radio input
- renders label
- supports checked
- supports defaultChecked
- supports disabled
- supports invalid
- supports required
- supports aria-label when label omitted
- calls onCheckedChange
- forwards native props
- applies custom className

Test RadioGroup:

- renders group label
- renders options
- supports controlled value
- supports defaultValue
- calls onValueChange
- shares name across options
- supports required
- supports invalid
- associates error message
- supports disabled group
- supports children composition

## Quality Checks

Before finishing:

- TypeScript compiles
- tests compile/pass
- Storybook compiles
- exports work
- no MUI imports
- no Tailwind utilities
- no hardcoded design values
- no SVG-only interactive controls
- native radio behavior is preserved
- Focus Ring utility integration is verified

## Final Output

After implementation, provide:

1. Architecture decisions
2. Accessibility decisions
3. Assumptions made
4. Missing tokens
5. Future improvements
6. Spec compliance confirmation
