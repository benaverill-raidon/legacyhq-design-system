# Button Component Checklist

## Purpose

A Button triggers an event or action. It helps users understand what will happen next and provides a clear, accessible control for primary, secondary, and contextual actions.

## Component Type

Atom

## Primary Use Cases

- Submit or save a form
- Continue to the next step in a flow
- Trigger an immediate action
- Open a dialog, menu, or workflow
- Confirm or cancel a decision
- Perform semantic actions such as warning, destructive/error, or discovery-related actions

## Do Not Use For

- Navigation-only links where an anchor is more appropriate
- Icon-only actions; use a future IconButton component
- Toggleable selected state; use a future ToggleButton component
- Long-running process indicators without a user-triggered action

## Design Decisions

- Use `appearance` and `tone` separately to avoid a large variant matrix.
- Use `children` for button text/content instead of a `buttonText` prop.
- Keep Button text-first; icon-only buttons should be handled by a separate IconButton component.
- Support icons before and after content, but do not expose icon size controls.
- Icons use the medium icon size for all button sizes.
- Icon gap remains consistent across sizes using `spacing-075`.
- Use shared Focus Ring utility classes instead of component-specific focus styles.
- Support `isLoading` while preserving the original label width to prevent layout shift.
- Support `isFullWidth` for layout flexibility.
- Do not support selected/toggled behavior in the base Button.

## Variant Model

### Size

- `xs`
- `sm`
- `md`
- `lg`

### Appearance

- `default`
- `primary`
- `subtle`

### Tone

- `neutral`
- `warning`
- `error`
- `discovery`

### States

- default
- hover
- pressed
- focus
- disabled
- loading

## Accessibility Requirements

- Render as a native `button` by default.
- Support native button attributes.
- Support `type="button"` as the default to avoid accidental form submission.
- Support `type="submit"` and `type="reset"` when provided.
- Do not use ARIA roles to recreate native button behavior.
- Disabled buttons should use the native `disabled` attribute.
- Loading buttons should prevent repeated activation.
- Loading buttons should expose loading state accessibly.
- Focus must be visible with keyboard navigation.
- Button text should clearly communicate the action.
- Do not rely on color alone to communicate destructive or warning actions.

## Loading Requirements

- When `isLoading` is true, render a Spinner in the leading content area.
- Preserve the original label/content width so the button does not shrink or jump.
- Keep the visible label when possible so the action remains understandable.
- Disable user interaction while loading.
- Loading state should not remove the button from tab order unless disabled behavior is intentionally applied.

## Dependencies

- Spinner
- Focus Ring primitive/utilities
- Icon component or icon slot support
- Design tokens
- CSS Modules

## Token Decisions

Use component-scoped tokens only where the value represents component anatomy.

Create component tokens for:

- `component.button.min-height.xs`
- `component.button.min-height.sm`
- `component.button.min-height.md`
- `component.button.min-height.lg`

Use existing semantic tokens for:

- padding-inline
- icon gap
- border radius
- border width
- typography
- color

## Size Reference

- `xs`: min-height `24px`
- `sm`: min-height `32px`
- `md`: min-height `40px`
- `lg`: min-height `48px`

## Spacing Reference

From Figma default tone examples:

- `xs`: horizontal padding `spacing-100`, min-height `24px`
- `sm`: horizontal padding `spacing-100`, min-height `32px`
- `md`: horizontal padding `spacing-150`, min-height `40px`
- `lg`: horizontal padding `spacing-200`, min-height `48px`
- icon/content gap: `spacing-075`
- border radius: `border-radius-sm`
- border width: `border-width-default`

## Storybook Structure

Use atom story structure:

```txt
Button
├─ Playground
├─ Variants
└─ Examples
```

Stories should document behavior, not create one story per variant permutation.

## QA Checklist

- Button renders text content correctly.
- Button supports all sizes.
- Button supports all appearances.
- Button supports all tones.
- Button supports hover, pressed, focus, disabled, and loading states.
- Loading state preserves width.
- Loading state prevents duplicate activation.
- Full-width button fills its container.
- Icons render before and after content.
- Icon gap remains consistent.
- Icon-only usage is not supported by this component.
- Focus Ring utility is applied.
- Button defaults to `type="button"`.
- No hardcoded colors.
- No hardcoded spacing except where component token generation requires source values.
- No hardcoded typography.
- No MUI.
- No Tailwind.
