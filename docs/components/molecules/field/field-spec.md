# Field

## Overview

### Purpose
Field wraps a single form control with a label, an optional message, and a validation state, and
wires them together so the control is correctly labelled and described.

### Description
Field is the "form field" layer the control components deliberately leave out. Text Field, Text
Area, and Select render only their control frame; Field is where the label and helper/error text
live, and where the `htmlFor`/`aria-describedby`/`aria-invalid`/`required` wiring is done once
instead of at every call site.

### Category
Molecule - it composes the Icon primitive (the message's status glyph) and a native `<label>`
around a control slot. The control it wraps is passed in as `children`, not owned, so a single Field
serves every control type.

### Design Reference
- Figma Component: `code-parts / <field>` (component set, node `4798:124451`, file `Components
  v1.0.0`, page "Field"), assembled from two sub-part sets: `code-parts / <label>` (node
  `4798:124439`) and `code-parts / <message>` (node `4798:124412`).
- Variant axes on `<field>`: `state` (default, error, valid) x `context` (default, inline) x `size`
  (all, lg, sm/md) = 9 variants. `context=default` uses one `size=all` variant (no indent);
  `context=inline` splits into `size=lg` and `size=sm/md`.
- `<message>` axes: `error` (true/false) x `valid` (true/false) x `context` x `size` - the status
  icon (`status_error` / `status_success`) and colour follow `error`/`valid`; the plain (both
  false) case has no icon.
- `<label>` axes: `context` x `size`, plus a `showRequired` boolean and a `labelText` string.
- The `<field>` root exposes a Figma **slot** for the control - mapped to React `children`.

---

## Usage Guidelines

### Use When
- A control needs a visible label and, optionally, helper or validation text - the common case for
  nearly every field in a form.
- You would otherwise hand-wire `<label htmlFor>`, `aria-describedby`, and `aria-invalid` around a
  control.

### Do Not Use When
- The control has no label, helper, or error at all - use the bare control with an `aria-label`.
- One label covers a *group* of controls (radios, checkboxes) - a `<label htmlFor>` targets a single
  control; use `<fieldset>`/`<legend>`.
- The message is page- or section-level - use Inline Message or Section Message.

---

## Anatomy

```text
Field (div.root, flex column, data-state/context/size)
├─ label.label (optional; native <label htmlFor>, --typography-heading-xxs)
│  └─ span.required (optional, "*", aria-hidden, --color-content-error)
├─ {children}  (the wrapped control - the slot - cloned to receive id/aria-*/required, plus appearance="subtle" when context=inline)
└─ div.message (optional; id, --typography-body-sm)
   ├─ span.messageIcon (error/valid only; aria-hidden; sm status Icon)
   └─ span.messageText
```

### Structure Notes
- The root is a single flex column: label, control, message stacked in that order.
- The label is a real `<label htmlFor>` pointing at the control's `id`. The `*` is decorative
  (`aria-hidden`) - the forwarded `required` conveys the requirement to assistive technology.
- The control is rendered as-is at the container's edge; only the label and message are indented in
  the inline context.
- The message's status icon is decorative (`aria-hidden`); its colour is carried by the Icon
  primitive's `color` (`error` / `success`).

---

## Behaviour

### Accessibility wiring (via `React.cloneElement` of the single child control)
- `id`: the control's own `id` if set, else `controlId`, else a generated `useId` id. The label's
  `htmlFor` and the message's `id` derive from it.
- `aria-describedby`: the message's id, merged with any `aria-describedby` the control already
  carries.
- `aria-invalid`: `true` when `state="error"`, unless the control already sets `aria-invalid`.
- `required`: forwarded when `required` is set, unless the control already sets `required`.
- `data-force-state`: forwarded to the control (documentation-only, for static Storybook state
  references), unless the control already sets it.
- `appearance`: `"subtle"` when `context="inline"` (see Context / Size), unless the control already
  sets its own `appearance`. This is the only injected prop tied to a Field axis rather than pure
  wiring - it exists because Figma models `context` as one shared axis across the field and control.
- The control's own props always win - Field only fills in what the consumer left unset.

### State
- `default`: plain helper text, `--color-content-subtle`, no icon.
- `error`: message `--color-content-error` + `status_error` icon; sets `aria-invalid` on the
  control. Does **not** set the control's own error border (pair with the control's `invalid` prop).
- `valid`: message `--color-content-success` + `status_success` icon.

### Context / Size (coupled, matching Figma's `size=all | lg | sm/md`)
- `context="default"`: label and message flush with the control's outer edge, and the control keeps
  its own appearance. **Size-independent** - every control size renders identically (Figma's single
  `size=all` default variant).
- `context="inline"` does two things, because Figma models `context` as one shared axis across the
  whole field: (a) it indents the label and message to the control's inner start padding for the
  size (`lg` -> `--spacing-md`, `sm` and `md` share `--spacing-sm`), aligning them to the control's
  inner text; and (b) it renders the control inline by injecting `appearance="subtle"` (the control's
  own `appearance` wins), so the field reads as one borderless inline unit.
- `size` therefore only does anything in the inline context, purely to align the label/message with
  the control's inner text. It never resizes the control (set the control's own `size` too).
- Because inline means a borderless control whose inner text the label lines up with, it is meant for
  text-bearing controls (Text Field, Select, Text Area, date/time pickers - all of which take
  `appearance="subtle"`); it has no meaningful effect on controls without inner text (Checkbox,
  Switch, Radio) - use `context="default"` there.

---

## Tokens

| Aspect | Token | Notes |
|---|---|---|
| Label typography | `--typography-heading-xxs-*` | Figma heading/xxs |
| Label colour | `--color-content-subtle` | |
| Required `*` colour | `--color-content-error` | |
| Label -> control gap | `--spacing-xs` (label `padding-bottom`) | Figma space/050 (4px) |
| Control -> message gap | `--spacing-xs` (message `padding-top`) | Figma spacing/xs (4px) |
| Message icon -> text gap | `--measurement-6` | Figma spacing/075 (6px) - no semantic spacing token yet; same precedent as Text Field / Toggle Button |
| Message typography | `--typography-body-sm-*` | Figma body/sm |
| Message colour (default) | `--color-content-subtle` | |
| Message colour (error) | `--color-content-error` | |
| Message colour (valid) | `--color-content-success` | |
| Inline indent (lg) | `--spacing-md` | matches Text Field lg inner start padding |
| Inline indent (sm/md) | `--spacing-sm` | matches Text Field sm/md inner start padding |

---

## Design Decisions

- **Field renders its own label and message, not the Label atom / Inline Message molecule.** Figma's
  `<label>` code-part is heading/xxs on `--color-content-subtle` with no background - a quiet form
  label, unlike the pill/overline-style Label atom (which has a background). Figma's `<message>`
  code-part is a compact sm-icon + body/sm line with only default/error/valid states, unlike Inline
  Message (larger, tone-based, sometimes interactive with a popup). Reusing either would have forced
  the wrong typography and states, so Field owns both parts directly.
- **`state` is the label/message layer, not the control's border.** Field can't know a control's
  styling prop name, so it sets only the universal `aria-invalid` and leaves the visual error border
  to the control's own `invalid`/`error` prop. Consumers pair `state="error"` with `<TextField
  invalid />`. This matches the system's wrapper-vs-control split.
- **Auto-wiring via `cloneElement`, consumer props win.** A form-field wrapper whose value is
  accessibility wiring should do that wiring, not document it as homework - so Field injects
  `id`/`aria-describedby`/`aria-invalid`/`required`. It only fills in unset props, so a control that
  declares its own id or aria state is never surprised. `cloneElement` is the same pattern Inline
  Edit already uses in this system.
- **`context` is one shared axis across the field AND its control - so it propagates.** In Figma,
  the same `context` property (standard/inline) sits on the `<field>`, the Text Field, the Select,
  etc. An inline field is a borderless (inline) control with its label/message aligned to the
  control's inner text. So Field propagates `context="inline"` to the control by injecting
  `appearance="subtle"` (the code name for that same axis - Text Field and Text Area use
  `appearance`, and Select now takes it as an alias for its `tone`). This is deliberately different
  from `state`: `state` maps to the control's *separate* `isInvalid` axis (a different Figma
  property), so it stays the consumer's call, whereas `context` is literally the same axis on both
  and so is wired through. The control's own `appearance` always wins, as with every injected prop.
- **`context`/`size` are coupled, and `size` only distinguishes anything inline.** Both `context`
  values keep the same vertical stack; the only label/message difference in the node data is a start
  padding (0 in `default`; the control's inner padding in `inline`). Figma models this as one
  `size=all` variant for the default context and separate `size=lg` / `size=sm/md` variants for the
  inline context. The code keeps a plain `sm|md|lg` `size` prop (usable, matches the control's own
  size vocabulary) but consumes it only via `.context_inline.size_*` rules, so the default context
  stays size-independent, honouring the same coupling. Since inline means a borderless control whose
  inner text the label lines up with, it is intended for text-bearing controls (Text Field, Select,
  Text Area, pickers), not for Checkbox/Switch/Radio.
- **The required `*` is decorative.** The forwarded native `required` conveys the state to assistive
  technology, so reading out the star as well would be redundant - it's `aria-hidden`.

---

## Acceptance Criteria

- Renders the label as a native `<label htmlFor>` wired to the control's id; the control gets its
  accessible name from the label with no `aria-label`.
- Generates a control id when the control has none; keeps the control's own id when it has one.
- Links the message to the control via `aria-describedby`, merged with any existing value.
- `state="error"` sets `aria-invalid` on the control; an explicit control `aria-invalid` wins.
- `required` forwards `required` to the control and shows a decorative (`aria-hidden`) `*`.
- Shows a status icon on `error`/`valid`, none on `default`.
- Sets `data-state`, `data-context`, `data-size` on the root; defaults `default`/`default`/`md`.
- `context="inline"` indents the label/message per size (`lg` -> `--spacing-md`, `sm`/`md` ->
  `--spacing-sm`) AND injects `appearance="subtle"` into the control (control's own `appearance`
  wins); `context="default"` does neither.
- Renders no `<label>` when `label` is omitted, and no message (nor `aria-describedby`) when
  `message` is omitted.
- Composes `className` (root), `labelClassName`, and `messageClassName`.
- Uses only semantic tokens (plus the documented `--measurement-6` gap); works in light and dark.
- Storybook includes Playground, States, Contexts, Content, AnyControl, and EdgeCases.
- Tests cover label/id wiring, describedby merge, aria-invalid, required, status icons, data
  attributes, omitted label/message, className composition, and force-state forwarding.
