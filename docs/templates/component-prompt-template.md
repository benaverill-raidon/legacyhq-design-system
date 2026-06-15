# Generate React Component

Use the attached component specification as the source of truth.

Reference:

- component-spec.md
- design tokens
- generated CSS variables
- project architecture

---

## Goal

Generate a production-ready React component.

---

## Requirements

### Framework

- React
- TypeScript

### Styling

- CSS Modules
- CSS Variables only
- No hardcoded values

Example:

```css
background: var(--color-action-primary);
```

### Accessibility

- WCAG AA compliant
- Keyboard accessible
- Screen reader support

### Testing

Generate:

- Component
- Types
- Storybook story
- Unit tests

---

## Expected Files

```txt
Component/
├─ Component.tsx
├─ Component.types.ts
├─ Component.module.css
├─ Component.test.tsx
├─ Component.stories.tsx
└─ index.ts
```

---

## Follow These Rules

1. Use design tokens.
2. Do not hardcode colors.
3. Do not hardcode spacing.
4. Use semantic tokens whenever available.
5. Support all documented states.
6. Support all documented variants.
7. Support all documented sizes.
8. Follow accessibility requirements.
9. Follow responsive requirements.
10. Match the component specification exactly.

---

## Deliverables

Generate:

- React component
- Types
- CSS module
- Storybook story
- Unit tests
- Export file

---

## Validation

Before finishing:

- Verify all props exist.
- Verify accessibility requirements are met.
- Verify design token usage.
- Verify TypeScript types.
- Verify Storybook examples.
- Verify component matches specification.
