# Focus Ring Checklist

## Component Information

### Name
Focus Ring

### Category
Primitive

### Related Components
- Button
- Text Field
- Checkbox
- Radio
- Range
- Select
- Link
- Pressable / Clickable primitives

---

## Purpose

### What problem does this primitive solve?
Focus Ring provides a visible focus indicator for focused interactive elements.

### Why does it need to exist?
Keyboard users need a clear visual indication of which interactive element currently has focus.

### What user goal does it support?
- Navigate the interface by keyboard
- Understand which control is currently active
- Use forms and controls without losing context

---

## Usage

### Where will this primitive be used?
- Buttons
- Form controls
- Inputs
- Links
- Interactive cards
- Custom pressable elements
- Components that wrap native interactive elements

### What are the most common use cases?
- Keyboard focus on a button
- Keyboard focus on a text field
- Keyboard focus on a checkbox
- Keyboard focus on a range/slider control
- Keyboard focus inside dark and light surfaces

### When should this primitive NOT be used?
- On non-interactive static content
- As a hover style
- As an error state
- As a selected state
- As decorative styling

---

## Content

### What content can be displayed?
None.

Focus Ring is visual styling only.

### Does it render children?
Yes, when used as a thin React wrapper.

Example:

```tsx
<FocusRing>
  <button>Button</button>
</FocusRing>
```

---

## Variants

### Size / Density
- default
- compact

### Token Mapping
- default = `--border-width-bold` / 2px
- compact = `--border-width-default` / 1px

### Color
Both variants use:

```css
--color-border-focused
```

---

## States

Required:
- Focus visible

Not Required:
- Hover
- Active
- Loading
- Disabled visual state

Focus Ring should only appear when focus needs to be visually indicated.

---

## Accessibility

### Does this support keyboard navigation?
Yes.

### Should it use `:focus` or `:focus-visible`?
Use `:focus-visible`.

### Does the focus indicator need sufficient contrast?
Yes. The focus ring should be clearly visible against adjacent colors.

### Is this an interactive component?
No. It is a visual primitive used to style or wrap interactive components.

---

## Responsive Behavior

### Mobile
Focus Ring should still work when keyboard or programmatic focus is used.

### Tablet
Same as desktop.

### Desktop
Focus Ring should appear clearly for keyboard navigation.

---

## Dependencies

### What components does this depend on?
None.

### What components depend on it?
Most interactive components.

---

## Notes

Final implementation decisions:
- Use CSS utility classes first.
- Also provide a thin React wrapper.
- Use outset ring only.
- Use 2px outline offset.
- Radius should inherit from the focused element where possible.
- Default variant uses 2px.
- Compact variant uses 1px.
- Use `:focus-visible`.
- Use `--color-border-focused` for both variants.
