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
| label | string | No | undefined |
| ariaLabel | string (deprecated: use `label`) | No | undefined |
| className | string | No | undefined |

Any other span attribute (`id`, `title`, `data-*`, native `aria-*`) is forwarded to the root `span`.

---

## Accessibility

### Keyboard Support
Not applicable.

Badge is not interactive.

### ARIA

Support:
- `label`, the count in words, such as "3 unread messages". Badge renders it as visually hidden text
  inside the span and hides the visible value from assistive technology (`aria-hidden`), so screen
  readers read the words in place of the number. It isn't an `aria-label`: the span has no role, and
  ARIA prohibits naming an element with the generic role, so screen readers may ignore one.
- `ariaLabel` is a deprecated alias for `label`, rendered the same way. `label` wins when both are set.
- Native attributes, including `aria-describedby`, are forwarded to the root `span`.

Example:

```tsx
<Badge label="1 unread notification">
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
- [ ] `label` is read in place of the visible value (hidden text, not `aria-label`)
- [ ] Contrast meets requirements

---

## Future Enhancements
- Overflow formatting (99+)
- Icon support
- Additional tones
