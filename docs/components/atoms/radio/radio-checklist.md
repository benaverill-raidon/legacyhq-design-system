# Radio Component Checklist

## Purpose

Radio inputs allow users to select exactly one option from a related set of choices. Use Radio when options are mutually exclusive and all available choices should be visible.

RadioGroup provides the required grouping behavior, shared name/value management, and accessible group labeling for forms and settings.

## Component Type

- Radio: atom
- RadioGroup: atom-level companion component
- Figma `radio-item`: Figma-only anatomy/assembly part, not a public React export

## Primary Use Cases

- Selecting one option from a short list
- Form questions with mutually exclusive answers
- Settings and preferences
- Intake forms
- Filter choices where only one option can be active

## Avoid Using Radio When

- Multiple selections are allowed; use Checkbox instead
- The list is very long; consider Select or Combobox
- The choice is binary and immediate; consider Switch only when the action is on/off and persistent
- The option is purely decorative or non-interactive

## Key Product Decisions

- Radio includes a visible label by default.
- Label may be omitted for compact/table use, but an accessible label is then required.
- RadioGroup should support both `options` and `children` composition.
- RadioGroup is responsible for single-selection behavior.
- Radio is built on native `<input type="radio">` semantics.
- Visual states use decorative SVG icons or internal visual indicators.
- Do not replace native radio behavior with divs, buttons, or SVG-only controls.

## Anatomy

Radio:

1. Root label/wrapper
2. Native radio input
3. Visual radio indicator
4. Label text
5. Optional required indicator when used standalone

RadioGroup:

1. Fieldset/root group
2. Optional legend/group label
3. Optional required indicator on group label
4. Optional description/help text
5. Radio options
6. Optional error message

## Variants and States

### Radio States

- unchecked
- checked
- invalid
- disabled
- required
- focus-visible
- hover
- pressed

### RadioGroup States

- default
- required
- invalid
- disabled group

## Accessibility Requirements

- Use native `<input type="radio">`.
- Use a shared `name` for radios in a group.
- Use `<fieldset>` and `<legend>` for RadioGroup when a group label is provided.
- Preserve browser keyboard behavior.
- Support arrow-key behavior through native radio semantics.
- Keep the input focusable unless disabled.
- Do not add `role="radio"` or `role="radiogroup"` unless replacing native semantics, which this component must not do.
- If visible label is omitted, require `aria-label` or `aria-labelledby`.
- Required state should be communicated at the group level when using RadioGroup.
- Invalid state should expose `aria-invalid` and connect error text with `aria-describedby` when error text is provided.

## Design Decisions

- Label typography: `body-md`.
- Default RadioGroup layout: vertical.
- Default RadioGroup gap: `0`.
- Radio visual size: 16px.
- Interaction target: 24px.
- Required indicator appears after the group label/legend.
- Selected radio uses selected bold background and inverse content for the inner mark.
- Figma uses shapes; implementation should draw the private indicator with CSS anatomy.
- Radio control shapes must not be added to the shared icon library.
- Focus styling must consume the Focus Ring utility classes.

## Dependencies

- React
- TypeScript
- CSS Modules
- Design tokens / CSS variables
- Focus Ring primitive utility classes
- Optional internal radio SVG assets

## Engineering Notes

- Keep Radio and RadioGroup in the same folder.
- Export both from the folder index.
- Do not expose a public `RadioItem` unless product/engineering later needs it.
- RadioGroup should support controlled and uncontrolled patterns.
- RadioGroup should support an `options` API and children composition.
- Radio should forward native input attributes where appropriate.
- Radio should support `className` for the root and a way to pass native input props.

## QA Checklist

- Radio renders with label.
- Radio renders without label when `aria-label` is provided.
- Checked state displays correct visual indicator.
- Unchecked state displays correct visual indicator.
- Disabled state is not interactive.
- Invalid state displays invalid styling.
- Focus state uses Focus Ring utility classes.
- RadioGroup allows only one selected value.
- RadioGroup supports controlled value.
- RadioGroup supports defaultValue.
- RadioGroup forwards name to all options.
- RadioGroup group label is announced correctly.
- Required state is announced correctly.
- Error text is associated correctly.
- Works in light and dark themes.
- Uses tokens only.
- No MUI.
- No Tailwind.
- No hardcoded colors, spacing, or typography values.
