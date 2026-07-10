# Checkbox Component Checklist

## Purpose

Checkbox is an input control that allows a user to select one or more options from a set. It supports selected, unselected, indeterminate, invalid, disabled, required, and focus-visible states.

## Component Type

- Category: Atom
- Public component: `Checkbox`
- Internal visual anatomy: `CheckboxIndicator`
- Figma-only part: `checkbox-item`

The Figma `checkbox-item` part should be documented as a Figma construction helper, not exported as a public React component unless a future engineering need appears.

## Use Cases

Use Checkbox when users need to:

- Select one or more independent options.
- Toggle an item in a list or table.
- Confirm agreement or acceptance.
- Select multiple rows in a table.
- Represent partial selection using an indeterminate state.

Do not use Checkbox when:

- Only one option can be selected from a set. Use Radio instead.
- The choice immediately changes a system setting. Consider Switch.
- The control is purely decorative.

## Content Rules

- Label text should be clear and action-neutral.
- Use sentence case unless product copy requires otherwise.
- Keep labels short when used in forms or tables.
- Required indicator appears after the label.
- Label is optional for compact/table use cases, but an accessible name is required when no visible label is rendered.

## Accessibility Requirements

- Use a native `<input type="checkbox">`.
- Do not recreate checkbox behavior with `div` or `button`.
- Support native form behavior.
- Support keyboard interaction through the native input.
- Use `aria-invalid` when invalid.
- Use `aria-required` when required if needed, while preserving native `required` behavior where appropriate.
- Support `aria-label` or `aria-labelledby` when no visible label is provided.
- Use `aria-checked="mixed"` for indeterminate state if needed.
- Disabled checkboxes must not be interactive.
- Focus styling must use the Focus Ring primitive utility classes.

## Interaction Requirements

- Clicking the label toggles the checkbox.
- Space toggles the checkbox when focused.
- Indeterminate visually overrides checked when both are provided.
- Component supports controlled and uncontrolled usage.
- `onCheckedChange` should expose the next checked value and the native change event.

Recommended signature:

```ts
onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
```

## Design Decisions

- Checkbox includes its label by default.
- Label typography uses `body-md`.
- Checkbox visual size is 16px.
- Interaction/focus target is at least 24px.
- Required indicator appears after the label.
- Checked and indeterminate states use the same selected fill token.
- Invalid checked and invalid indeterminate states use invalid border treatment while preserving selected/dark fill behavior.
- Focus state consumes Focus Ring utility classes rather than duplicating focus ring CSS.

## Dependencies

- React
- TypeScript
- CSS Modules
- Focus Ring primitive utility classes
- Design tokens generated from Figma
- Storybook
- Vitest
- React Testing Library

## Open Risks / Watchouts

- Ensure visually hidden input remains accessible and receives focus.
- Ensure focus ring appears around the visual indicator, not only the hidden input.
- Ensure disabled styling applies to both indicator and label.
- Ensure required asterisk is not the only indicator of required status in form-level context.
- Ensure invalid state is not communicated by color alone when an error message exists nearby.
