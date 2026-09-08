# Generate Field Component

Use `field-spec.md` as the source of truth.

## Goal

Generate a production-ready Field component.

Field wraps a single form control (Text Field, Text Area, Select) with a label, an optional message,
and a validation state, and wires the three together for accessibility. It is a molecule - it
composes the Icon primitive (the message's status glyph) and a native `<label>` around a control
slot (the wrapped control, passed as `children`).

---

## Framework

- React
- TypeScript

---

## Styling

- CSS Modules
- CSS Variables only
- Use generated token CSS
- No hardcoded values (except the documented `--measurement-6` gap for Figma spacing/075)

---

## Expected Files

```txt
field/
├─ field.tsx
├─ field.types.ts
├─ field.module.css
├─ Field.test.tsx
├─ Field.stories.tsx
├─ field.mdx
└─ index.ts
```

---

## Anatomy

A single flex column: an optional native `<label htmlFor>` (with an optional decorative required
`*`), then the wrapped control (the slot), then an optional message (a decorative status icon on
error/valid, plus the message text).

---

## Props

- `children: React.ReactElement` - the single control to wrap (cloned to receive the wiring)
- `label?: React.ReactNode`
- `message?: React.ReactNode`
- `state?: 'default' | 'error' | 'valid'` (default `'default'`)
- `context?: 'default' | 'inline'` (default `'default'`)
- `size?: 'sm' | 'md' | 'lg'` (default `'md'`)
- `required?: boolean` (default `false`)
- `controlId?: string`
- `className?`, `labelClassName?`, `messageClassName?`
- `...rest` forwarded to the root `div`

---

## Behaviour

- Clone the single child control to inject `id` (generated with `useId` when the control has none),
  `aria-describedby` (the message id, merged with any existing value), `aria-invalid` (on
  `state="error"`), `required` (when `required`), `data-force-state`, and `appearance="subtle"` (on
  `context="inline"`) - filling in only props the control left unset. The control's own props always
  win.
- The label is a real `<label htmlFor>` pointing at the control's id, so the control's accessible
  name comes from the label (no `aria-label` needed).
- `state` colours the message and prepends a status icon, and `error` sets `aria-invalid` - but it
  does NOT set the control's own error border (the consumer pairs `state="error"` with the control's
  `invalid` prop).
- `context="inline"` indents the label and message by the control's inner start padding for the size
  (`lg` -> `--spacing-md`, `sm`/`md` -> `--spacing-sm`) AND injects `appearance="subtle"` into the
  control so it renders inline/borderless (Figma models `context` as one shared axis across the field
  and control); `context="default"` does neither. This differs from `state`, which maps to the
  control's separate invalid axis and is not injected.
- The required `*` is decorative (`aria-hidden`); the forwarded native `required` conveys the state.

---

## Do NOT

- Do NOT reuse the Label atom or Inline Message molecule - render Field's own label and message
  (their typography and state set differ).
- Do NOT set the control's visual error border from `state` - that's the control's own prop.
- Do NOT overwrite props the control already declares.
- Do NOT accept multiple children or a fragment - `children` is a single control element.

---

## Storybook

Include `Playground`, `States`, `Contexts` (default is size-independent; inline shows the lg vs
sm/md text-alignment indent), `Content`, `AnyControl`, and `EdgeCases` (including a dark-surface
reference and a live-validation example).

---

## Tests

Cover: label/id wiring (accessible name from the label), generated vs. own id, aria-describedby
merge, aria-invalid on error (and control override), required forwarding + decorative asterisk,
status icons per state, root data attributes and defaults, omitted label/message, className
composition, force-state forwarding, and token usage in the CSS.
