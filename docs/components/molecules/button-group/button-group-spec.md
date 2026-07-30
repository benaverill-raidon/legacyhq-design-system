# Button Group

## Overview

### Purpose
Button Group gives users access to a set of frequently performed, related actions with consistent
spacing and orientation.

### Description
Use Button Group to lay out two or more related `Button`/`IconButton` elements in a row or column
with a single, consistent gap between them.

### Category
Molecule

### Design Reference
- Figma Component: `button-group` (component set, node `1690:7026`, file `Components v1.0.0`)
- Variant axes: `count` (2, 3, 4) x `orientation` (inline, stacked) = 6 variants
- Every button in every variant is a real `button` component instance (`size=sm`, `tone=primary`),
  each keeping its own full corner radius - the group applies no visual treatment of its own beyond
  spacing and direction.

---

## Usage Guidelines

### Use When
- A toolbar of related, independent actions
- A dialog's primary/secondary/tertiary action row
- A form's action buttons

### Do Not Use When
- The buttons represent mutually exclusive selection (a segmented control) - use a
  selection-oriented pattern instead
- Only one button is present - Button Group adds no value over a bare `Button`
- Visually joined/connected buttons are needed - Figma's source keeps buttons separated by a gap,
  not seamlessly merged

---

## Anatomy

```text
ButtonGroup
├─ Button
├─ Button
└─ Button (2-4+ children in the Figma reference; not capped in code)
```

### Structure Notes
- Single root container (`div`)
- Any number of `children` (typically `Button`/`IconButton` elements)
- No owned button styling - size, appearance, and tone are set on each child directly
- No wrapping - matches Figma's `layoutWrap: NO_WRAP`

---

## Variants

### Orientation

| Orientation | Figma value | Description |
|-------------|-------------|--------------|
| horizontal | inline | Buttons laid out in a row (default) |
| vertical | stacked | Buttons laid out in a column |

Figma names this axis' values `inline`/`stacked`. The component renames them to
`horizontal`/`vertical` to match this design system's existing `RadioGroup.orientation` prop
(`'vertical' | 'horizontal'`), so every "group of controls" component in the library shares the same
orientation vocabulary.

Figma's `count` axis (2, 3, 4) is not a real prop - it only demonstrates the pattern with different
numbers of example buttons. The component accepts any number of `children`.

---

## Content Rules

### Supported Content
`Button` and/or `IconButton` elements (or any other native-focusable control that makes sense as a
grouped action). Button Group does not validate child type.

### Content Length
No fixed limit - Figma demonstrates 2-4 buttons, but the component does not cap the count.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| children | ReactNode | Yes | - |
| orientation | `'horizontal' \| 'vertical'` | No | `'horizontal'` |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` | No | - |

`aria-label` / `aria-labelledby` are accepted via the native `div` attributes (not a bespoke
`ariaLabel` prop) - Button Group extends `React.HTMLAttributes<HTMLDivElement>` directly, matching
the `Button`/`IconButton` family's convention of exposing real ARIA attribute names rather than a
custom-cased equivalent.

---

## Accessibility

### Keyboard Support
None added. Each child button keeps its native Tab order and its own keyboard behavior - Button
Group does not implement roving tabindex or arrow-key navigation, because its children are
independent actions, not a single composite control.

### ARIA

- No label provided: plain `div`, no `role`.
- `aria-label` or `aria-labelledby` provided: `role="group"` is added automatically, so the set of
  actions is announced as a named group.

Example:

```tsx
<ButtonGroup aria-label="Document actions">
  <Button appearance="primary">Save</Button>
  <Button appearance="subtle">Cancel</Button>
</ButtonGroup>
```

---

## Design Tokens

### Spacing
Gap between buttons is `--spacing-xs` (4px) in both orientations, read directly from the Figma
auto-layout `itemSpacing` (4px, unchanged across all 6 variants).

### Layout
`display: inline-flex` (hugs content, matching Figma's `AUTO` sizing on both axes), `flex-direction`
driven by `orientation`, `align-items: flex-start` (matching Figma's `MIN` counter-axis alignment -
buttons are not stretched to match a sibling's width or height).

No radius, color, or typography tokens are owned by Button Group itself - all visual styling comes
from the `Button`/`IconButton` children.

---

## Behaviors

### Default
Lays out its children with a consistent gap in the given orientation. No interaction, no animation,
no state of its own.

---

## Dependencies

### Uses
- Button (typically)
- Icon Button (optionally)

### Used By
- Toolbars
- Dialog action rows
- Form action rows

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded spacing or layout values
- No MUI dependency
- No Tailwind dependency
- Do not re-style or override the appearance of child buttons - Button Group only contributes
  spacing and direction

---

## QA Checklist

### Visual
- [ ] Matches Figma spacing (4px) in both orientations
- [ ] Buttons keep their own width/height (no stretch)
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] children render in order
- [ ] orientation renders correctly
- [ ] Works with 2, 3, 4, or more children
- [ ] Native div attributes (className, data-*, etc.) forward correctly

### Accessibility
- [ ] No label: no role, plain div
- [ ] aria-label present: role="group" and the label are both exposed
- [ ] Each child button remains independently focusable via Tab

---

## Future Enhancements
- A `fullWidth`-style prop if a stretched/equal-width variant is added to Figma
