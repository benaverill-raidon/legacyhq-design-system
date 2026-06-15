# Icon Checklist

## Component Information

### Name
Icon

### Category
Atom / Foundational UI Asset

### Related Components
- Button
- Icon Button
- Text Field
- Select
- Menu Item
- Navigation Item
- Checkbox
- Radio
- Badge
- Tooltip

---

## Purpose

### What problem does this component solve?
Icon provides a consistent, reusable way to render visual symbols across the product.

### Why does it need to exist?
The product has a large set of SVG icons that need consistent sizing, spacing, color, accessibility, naming, and documentation.

### What user goal does it support?
- Quickly recognize actions, objects, and statuses
- Scan interfaces more efficiently
- Understand supporting meaning alongside text
- Navigate complex product surfaces with less visual friction

---

## Usage

### Where will icons be used?
- Buttons
- Forms
- Navigation
- Tables
- Cards
- Empty states
- Menus
- Toolbars
- Status indicators

### What are the most common use cases?
- Action icons
- Navigation icons
- Object/entity icons
- Status or feedback icons
- Supporting visual cues beside labels

### When should Icon NOT be used?
- As a logo
- As decorative artwork
- As the only way to communicate critical meaning
- As a replacement for clear text labels
- In arbitrary colors outside approved content tokens

---

## Icon Sources

### Current Source
All SVG icons are exported to:

```txt
packages/ui/src/assets/icons/source/
```

### Source Types
Icons may originate from MUI or custom product work, but source origin should not be exposed as part of the public API.

---

## Icon Classification

### Multi-Purpose Icons
Icons that can be used in many contexts and are named descriptively after what they represent.

### Single-Purpose Icons
Icons reserved for a specific meaning or product concept.

### Classification Rule
Do not organize icons into separate folders by classification. Use metadata instead.

---

## Variants

### Size
- sm = 12px
- md = 16px

### Spacing
- none = icon box matches icon size
- spacious = icon sits inside a 24px container

### Color
Icons consume color-content tokens.

Supported colors:
- default
- subtle
- inverse
- brand
- success
- warning
- error
- information
- disabled

---

## Accessibility

### Decorative Icons
Most icons are decorative when paired with visible text.

```tsx
<SearchIcon decorative />
```

### Meaningful Icons
If the icon communicates meaning without visible text, provide a title.

```tsx
<SearchIcon title="Search" decorative={false} />
```

### Requirement
Every generated icon must support:
- `title`
- `decorative`

Default:
- `decorative = true`

---

## Dependencies

### What does this depend on?
- SVG source files
- CSS variables
- generated token CSS
- SVGR or equivalent SVG-to-React generation

### What depends on this?
Nearly every interactive and data-display component.

---

## Notes

Icon is a core system foundation. Keep the API small and consistent.

Do not create separate folders for MUI/custom or single-purpose/multi-purpose icons. Use metadata for classification and Storybook grouping.
