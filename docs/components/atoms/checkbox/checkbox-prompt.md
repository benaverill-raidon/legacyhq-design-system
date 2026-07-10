# Checkbox Implementation Prompt

Please implement the Checkbox atom using this file, the component spec, checklist, Figma screenshots, and available design token CSS files.

## Inputs

Use these files as source material:

- checkbox-checklist.md
- checkbox-spec.md
- checkbox-prompt.md
- Figma screenshots
- tokens.css
- light.css
- dark.css

Priority order:

1. checkbox-spec.md
2. checkbox-prompt.md
3. Figma screenshots
4. checkbox-checklist.md

If anything conflicts, follow the highest-priority source.

## Goal

Create a production-ready React + TypeScript Checkbox atom for the internal design system.

The Checkbox should be accessible, token-driven, theme-aware, and suitable for forms, lists, and table row selection.

## Folder Structure

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

## Architecture

Implement a public `Checkbox` component.

Use a native `<input type="checkbox">` for accessibility and form behavior.

Use a custom visual indicator for styling.

Treat the Figma `checkbox-item` as internal/Figma-only anatomy. Do not export it as a separate public React component unless absolutely necessary.

## API Requirements

Support:

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

## Behavior Requirements

- Support controlled usage with `checked`.
- Support uncontrolled usage with `defaultChecked`.
- Support `indeterminate`.
- If `checked` and `indeterminate` are both true, indeterminate wins visually.
- Use a ref/effect to set the native input `indeterminate` property.
- Clicking the label toggles the checkbox.
- Space toggles the checkbox when focused.
- `onCheckedChange` receives the next checked boolean and the native change event.
- Disabled checkbox cannot be toggled.
- Label is optional, but label-less usage must support accessible naming through `aria-label` or `aria-labelledby`.

## Visual Requirements

- Checkbox indicator is 16px by 16px.
- Interaction/focus target is at least 24px by 24px.
- Label typography uses `body-md`.
- Required asterisk appears after the label.
- Checked and indeterminate use the same selected fill token.
- Invalid checked and invalid indeterminate states use invalid border treatment and selected/dark fill per Figma.
- Use Focus Ring primitive utility classes for focus-visible styling.
- Do not duplicate focus-ring implementation inside Checkbox.

## Token Requirements

Use CSS variables only.

Do not use:

- MUI
- Tailwind
- hardcoded colors
- hardcoded spacing when an equivalent token exists
- hardcoded typography values when typography tokens exist

Use semantic tokens from generated CSS where available.

If a required token is missing, document it in the final output and use the closest appropriate existing token only when needed.

## Styling Requirements

- Use CSS Modules.
- Root should be inline-flex.
- Align items center.
- Use tokenized gap.
- Keep native input accessible while visually hidden.
- Visual indicator should not shift layout between states.
- Use inline SVG or CSS pseudo-elements for check and indeterminate marks.
- Support light and dark themes through CSS variables.

## Accessibility Requirements

- Use native checkbox semantics.
- Do not add unnecessary ARIA roles.
- Support `aria-invalid` when invalid.
- Support `aria-checked="mixed"` when indeterminate if needed.
- Preserve `name`, `value`, `required`, `disabled`, and form behavior.
- Label-less usage must require an accessible name via native input props.

## Storybook Requirements

Create documentation-style stories.

Use atom structure:

```txt
Checkbox
├─ Playground
├─ Variants
└─ Examples
```

Include:

- Playground
- Unchecked
- Checked
- Indeterminate
- Invalid
- Disabled
- Required
- Focus-visible example
- Table row selection example with no visible label
- Select-all parent checkbox example

## Test Requirements

Use Vitest and React Testing Library.

Test:

- renders with label
- renders without label when aria-label is provided
- uncontrolled toggle behavior
- controlled checked behavior
- onCheckedChange callback
- indeterminate state
- indeterminate visual precedence over checked
- invalid state and aria-invalid
- disabled state
- required state
- custom className
- native input attributes such as name and value
- native checkbox role

## Quality Requirements

Before finishing:

- Verify TypeScript compiles.
- Verify tests compile.
- Verify Storybook compiles.
- Verify token usage.
- Verify no MUI dependencies.
- Verify no Tailwind dependencies.
- Verify component exports from index.ts.
- List assumptions.
- List missing tokens.
- Summarize architecture decisions.

