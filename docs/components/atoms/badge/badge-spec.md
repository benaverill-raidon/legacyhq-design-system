# Badge

## Overview

### Purpose
Badge is a compact visual indicator for numeric values such as tallies, counts, and scores.

### Description
Use Badge to display short numeric information inline with other interface elements.

### Tier
Atom

### Design Reference
- Figma Component: Badge
- Variants:
  - default
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
| tone | 'default' \| 'brand' \| 'success' \| 'error' | No | 'default' |
| ariaLabel | string | No | undefined |
| className | string | No | undefined |

---

## Accessibility

### Keyboard Support
Not applicable.

Badge is not interactive.

### ARIA

Support:
- `ariaLabel`, rendered as `aria-label` on the root `span`. The span has no role, and ARIA prohibits
  naming an element with the generic role, so screen readers may ignore it; visible context next to
  the badge is the reliable way to explain a count.
- No other attribute is forwarded: Badge doesn't spread remaining props onto its span.

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
| default | `--color-background-neutral-bold-default` | `--color-content-inverse-default` |
| brand | `--color-background-brand-primary-bold-default` | `--color-content-inverse-default` |
| success | `--color-background-success-bold-default` | `--color-content-inverse-default` |
| error | `--color-background-error-bold-default` | `--color-content-inverse-default` |

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
No component composes Badge today. It's placed beside navigation items, table cells, cards, and
list items by the code that renders them.

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
