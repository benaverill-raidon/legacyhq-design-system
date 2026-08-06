# Generate Inline Edit Component

Use `inline-edit-spec.md` as the source of truth.

## Goal

Generate a production-ready Inline Edit component.

Inline Edit is a controlled-`value` molecule that clones a single child (typically a subtle
`TextField`) for a read-only display and an editable control, owns editing state and the
in-progress draft internally, and starts editing on click/focus - never before.

---

## Framework

- React
- TypeScript

---

## Styling

- CSS Modules
- CSS Variables only
- Use generated token CSS
- No hardcoded values

---

## Expected Files

```txt
inline-edit/
├─ inline-edit.tsx
├─ inline-edit.types.ts
├─ inline-edit.module.css
├─ InlineEdit.test.tsx
├─ InlineEdit.stories.tsx
├─ inline-edit.mdx
└─ index.ts
```

---

## Props

```ts
export interface InlineEditProps {
  value: string;
  children: React.ReactElement<{
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    readOnly?: boolean;
  }>;
  onConfirm?: (value: string) => void;
  onCancel?: () => void;
  actionButtons?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
}
```

Defaults:

```ts
actionButtons = true
confirmLabel = 'Confirm'
cancelLabel = 'Cancel'
```

---

## Behavior Rules

- Editing state (`isEditing`) and the in-progress draft are internal (`React.useState`) - there is
  no external prop to start already editing.
- Clone `children` via `React.cloneElement` for both states, so the underlying DOM node (and its
  focus) persists across the transition:
  - Not editing: clone with `value`, `readOnly: true`, `onFocus` starting editing (and seeding the
    draft from `value`).
  - Editing: clone with the draft value and an `onChange` that updates it.
- Confirm calls `onConfirm(draft)` and returns to not-editing.
- Cancel calls `onCancel()` (no draft passed - the parent already has `value`) and returns to
  not-editing; the next clone shows `value` again since the draft is discarded.

---

## Accessibility Rules

- No role or accessible name of its own - a transparent wrapper around the cloned child.
- The confirm/cancel `IconButton`s always get an `aria-label` from `confirmLabel`/`cancelLabel`.
- `Enter` calls `onConfirm` (with the draft, and `event.preventDefault()`) while editing; `Escape`
  calls `onCancel` while editing. Neither fires before editing starts.
- Do not add roving tabindex or custom focus management - native Tab order through the cloned child,
  then cancel, then confirm. `readOnly` (not `disabled`) keeps the child in the tab order while not
  editing.

---

## Storybook Stories

Create:
- Playground
- Variants (actionButtons on/off, both starting read-only)
- Content (a live, fully working click-to-edit example with real state; sizes; custom labels) - use
  `<TextField appearance="subtle" />` as the child in every example
- Edge Cases (long content, narrow container, dark surface)

---

## Test Requirements

Create tests for:
- renders the child read-only (no action buttons) before any interaction
- focusing/clicking the read-only child starts editing and shows the action buttons
- `actionButtons={false}` hides the buttons while still editing
- confirm calls `onConfirm` with the typed draft
- confirming returns to read-only, now showing the new value
- cancel discards the draft, reverts to `value`, and calls `onCancel`
- `Enter` confirms while editing
- `Escape` cancels while editing
- `Enter`/`Escape` do nothing before editing starts
- `confirmLabel`/`cancelLabel` set the accessible names of the action buttons
- `className` applies to the root
- gap token present in the CSS module

---

## Rules

1. Follow `inline-edit-spec.md` exactly.
2. Use semantic CSS variables - never primitives.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. Do not expose an external `isEditing`/`state` prop - editing always starts from a read-only
   display via click/focus, never before.
8. Use every Storybook example with a subtle-appearance `TextField` as the cloned child, matching
   the most common real-world usage.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders every story.
- Verify CSS uses variables.
- Verify implementation matches the spec.
