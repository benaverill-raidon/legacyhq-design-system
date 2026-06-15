# Badge

## Overview

### Purpose
Badge is a compact visual indicator for numeric values such as tallies, counts, and scores.

### Description
Use Badge to display short numeric information inline with other interface elements.

### Category
Atom

### Design Reference
- Figma Component: Badge
- Variants:
  - default
  - inverse
  - brand
  - success
  - error

---

## Usage Guidelines

### Use When
- Displaying counts
- Displaying small totals
- Displaying score changes
- Displaying lightweight numeric indicators

### Do Not Use When
- Displaying long text
- Displaying complex status information
- Displaying actions

---

## Anatomy

```text
Badge
└─ Text
```

### Structure Notes
- Single container
- Single text value
- No icons
- No supporting text

---

## Variants

| Tone | Description |
|--------|-------------|
| default | Standard badge |
| inverse | For dark surfaces |
| brand | Brand emphasis |
| success | Positive values |
| error | Negative values |

---

## Content Rules

### Supported Content
Examples:
- 1
- +1
- -1

### Content Length
Recommended:
- 1–4 characters

Badge content should never wrap.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| children | ReactNode | Yes | - |
| tone | 'default' \| 'inverse' \| 'brand' \| 'success' \| 'error' | No | 'default' |
| ariaLabel | string | No | undefined |
| className | string | No | undefined |

---

## Accessibility

### Keyboard Support
Not applicable.

Badge is not interactive.

### ARIA

Support:
- aria-label

Example:

```tsx
<Badge ariaLabel="1 unread notification">
  1
</Badge>
```

---

## Design Tokens

### Colors

Use semantic tokens.

Suggested mappings:

| Tone | Background Token | Text Token |
|---------|------------------|-------------|
| default | surface/default | content/default |
| inverse | surface/inverse | content/inverse |
| brand | background/brand | content/inverse |
| success | background/success | content/inverse |
| error | background/error | content/inverse |

### Typography
Use typography tokens.

### Radius
Use border radius tokens.

### Spacing
Use spacing tokens.

---

## Behaviors

### Default
Badge displays content.

No interaction.

No animation.

---

## Dependencies

### Uses
None

### Used By
- Navigation
- Button
- Table
- Card
- List Item

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded colors
- No hardcoded spacing
- No MUI dependency
- No Tailwind dependency

---

## QA Checklist

### Visual
- [ ] Matches Figma
- [ ] Light mode works
- [ ] Dark mode works
- [ ] All tones work

### Functional
- [ ] children render
- [ ] tone renders correctly
- [ ] className applies correctly

### Accessibility
- [ ] aria-label works
- [ ] Contrast meets requirements

---

## Future Enhancements
- Overflow formatting (99+)
- Icon support
- Additional tones
