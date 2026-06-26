# Focus Ring

## Overview

### Purpose
Focus Ring is a primitive used to visually indicate the currently focused interactive element.

### Description
Use Focus Ring to provide consistent focus styling across interactive components such as buttons, form controls, links, and custom pressable elements. It should appear when an element receives keyboard focus or otherwise requires visible focus indication.

### Category
Primitive

### Design Reference
- Figma Component: Focus Ring
- Figma Variant:
  - `borderWidth`: `default`, `compact`
- Visual examples include focus rings applied to:
  - Button
  - Checkbox
  - Text field
  - Range / slider

---

## Design Philosophy

Focus Ring is a behavioral visual primitive.

Its purpose is to provide consistent focus visibility across interactive components. It should not introduce interaction behavior, change semantics, or make non-interactive elements focusable.

Focus Ring should be used by higher-level components and patterns to support keyboard accessibility.

---

## Usage Guidelines

### Use When
- An interactive element receives keyboard focus
- A custom component needs visible focus indication
- A component wraps a native focusable element
- A focus indicator needs to be consistent across the system

### Do Not Use When
- Styling hover state
- Styling selected state
- Styling error state
- Decorating static content
- Indicating active navigation state

---

## Anatomy

```text
Focus Ring
└─ Ring outline around focused element
```

### Structure Notes
- Focus Ring does not display text.
- Focus Ring does not contain icons.
- Focus Ring does not change the component label or content.
- Focus Ring should be available as CSS utility classes.
- Focus Ring should also provide a thin React wrapper.
- The ring should visually surround the focused control.
- The ring should be outset only for v1.
- The ring should not shift layout.

---

## Variants

| Variant | Token | Width | Description |
|----------|-------|-------|-------------|
| default | `--border-width-bold` | 2px | Standard focus ring |
| compact | `--border-width-default` | 1px | Tighter focus ring for compact controls |

### Variant Rules
- Use `default` for most components.
- Use `compact` for smaller or tighter controls.
- Both variants use `--color-border-focused`.
- Do not use discovery, brand, or status colors for Focus Ring in v1.

---

## States

### Focus Visible
The ring appears when the element should visibly indicate focus.

### Default
No ring is visible.

### Hover
Focus Ring is not a hover style.

### Active
Focus Ring is not an active style.

### Disabled
Disabled elements should not receive focus and therefore should not show Focus Ring.

---

## Properties (API)

Recommended v1 React wrapper API:

| Property | Type | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| children | ReactElement | Yes | - | Focusable child element |
| borderWidth | `'default' \| 'compact'` | No | `'default'` | Visual ring thickness |
| className | string | No | undefined | Optional class name for the wrapper |
| disabled | boolean | No | false | Prevents focus ring styling when true |

Recommended TypeScript:

```ts
export type FocusRingBorderWidth = 'default' | 'compact';

export interface FocusRingProps {
  children: React.ReactElement;
  borderWidth?: FocusRingBorderWidth;
  className?: string;
  disabled?: boolean;
}
```

### CSS Utility Classes
Also expose reusable CSS classes for internal component styling.

Recommended classes:
- `focusRing`
- `focusRingDefault`
- `focusRingCompact`

---

## Accessibility

### Keyboard Support
Focus Ring supports keyboard navigation by making focused controls visually identifiable.

### Focus Behavior
- Use `:focus-visible`.
- Avoid showing the focus ring on every mouse click.
- Do not remove native focus indicators unless this custom focus style replaces them with an accessible equivalent.
- Do not make non-interactive elements focusable.

### ARIA Requirements
None.

Focus Ring itself should not add ARIA roles or labels.

### Screen Reader Requirements
None.

Focus Ring is visual only. The focused element itself remains responsible for name, role, value, and interaction semantics.

### WCAG Notes
Focus indicators support focus visibility requirements. The indicator should be visible and maintain sufficient contrast against adjacent colors.

---

## Design Tokens

### Color
Required token:

```css
--color-border-focused
```

Both variants use this token.

### Border Width
Required tokens:

```css
--border-width-bold
--border-width-default
```

Mapping:

| Variant | Token |
|----------|-------|
| default | `--border-width-bold` |
| compact | `--border-width-default` |

### Radius
Focus Ring should inherit or align with the focused element radius where possible.

### Offset
Use `2px` outline offset for v1.

This may become a token later, but should not block implementation.

### Motion
No motion required for v1.

---

## Behaviors

### Default
No visible ring.

### Focus Visible
The ring appears around the focused element.

### Disabled
No ring.

---

## Responsive Behavior

### Mobile
Focus Ring should still work for keyboard or programmatic focus. Do not rely on hover behavior.

### Tablet
Same as desktop.

### Desktop
Focus Ring should be clearly visible during keyboard navigation.

---

## Dependencies

### Uses
None.

### Used By
- Button
- Text Field
- Checkbox
- Radio
- Range
- Select
- Link
- Pressable
- Interactive cards

---

## Engineering Notes

### Implementation Requirements
- Use CSS variables from generated token CSS.
- Use `--color-border-focused` for ring color.
- Use `--border-width-bold` for default.
- Use `--border-width-default` for compact.
- Use `:focus-visible`.
- Use an outset ring.
- Use `2px` outline offset.
- Radius should inherit from the focused element where possible.
- Ensure focus ring does not shift layout.
- Ensure focus ring is visible on light and dark surfaces.
- Do not import MUI.
- Do not import Tailwind.

### Recommended CSS Approach

```css
.focusRing:focus-visible {
  outline-style: solid;
  outline-color: var(--color-border-focused);
  outline-offset: 2px;
}

.focusRingDefault:focus-visible {
  outline-width: var(--border-width-bold);
}

.focusRingCompact:focus-visible {
  outline-width: var(--border-width-default);
}
```

### Technical Constraints
- Focus Ring must not make non-interactive elements focusable.
- Focus Ring must not add keyboard behavior by itself.
- Focus Ring should be reusable across components.

---

## QA Checklist

### Visual
- [ ] Ring matches Figma examples
- [ ] Default variant uses 2px
- [ ] Compact variant uses 1px
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Ring does not shift layout
- [ ] Ring is visible around buttons
- [ ] Ring is visible around inputs
- [ ] Ring is visible around checkboxes
- [ ] Ring is visible around slider/range controls

### Functional
- [ ] Appears on keyboard focus
- [ ] Does not appear unnecessarily on hover
- [ ] Does not apply to disabled elements
- [ ] Can be reused across components
- [ ] React wrapper works
- [ ] CSS utility classes work

### Accessibility
- [ ] Focus indicator is clearly visible
- [ ] Indicator has sufficient contrast
- [ ] Native semantics remain on the focused element
- [ ] No unnecessary ARIA is added

---

## Future Enhancements
- Tokenized focus offset
- Inset focus ring
- Focus ring utility package
- Per-component radius inheritance strategy
