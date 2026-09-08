# Field

Field is a molecule that wraps a single form control - Text Field, Text Area, Select - with a label,
an optional message, and a validation state, and wires the three together so the control is
correctly labelled and described. It is the "form field" layer the control components deliberately
leave out: Text Field renders only the bare input frame and has no label of its own, so Field is
where the label and helper/error text live. This is the "Form Field" molecule that Text Field's own
doc set names as its natural next step.

It's a molecule because it composes primitives (the Icon primitive for the message's status glyph)
and a native `<label>` around a control slot; the control it wraps is passed in as `children` rather
than owned, so a single Field serves every control type equally.

Use Field wherever a control needs a visible label above it and, optionally, helper or validation
text below it - the common case for nearly every field in a form. Use the control on its own (with
an `aria-label`) only when it genuinely has no label, helper, or error, such as a toolbar search box.

Do not use Field to label a *group* of controls (a set of radios or checkboxes) - a `<label
htmlFor>` points at exactly one control, so a group needs a `<fieldset>`/`<legend>` instead. Do not
use Field's message for a page- or section-level message; that's Inline Message or Section Message.
Field's message is scoped to the one control it wraps.

## What Field wires up for you

Field's whole reason to exist is the accessibility wiring, so it does it automatically rather than
leaving it to each call site:

- The label is a real `<label htmlFor>` pointing at the control's `id`. When the control has no
  `id`, Field generates one (via `useId`) and injects it, so the control gets its accessible name
  from the label - no `aria-label` needed on the control.
- The message is linked to the control with `aria-describedby`, **merged** with any
  `aria-describedby` the control already carries (never clobbered).
- `state="error"` sets `aria-invalid` on the control.
- `required` forwards `required` to the control and shows a decorative `*` after the label.
- `context="inline"` renders the control inline (borderless) by giving it `appearance="subtle"`, so
  the whole field reads as one inline unit (see Context and size below).

Field only ever *fills in* wiring the control left unset - the control's own `id`, `aria-invalid`,
`aria-describedby`, `required`, and `appearance` always win. Because the control is cloned to receive
these props, `children` must be a single React element (not text, a fragment, or multiple elements).

## State is the label/message layer only

`state` (`default` / `error` / `valid`) colours the message and prepends a status icon, and `error`
sets `aria-invalid` - but it deliberately does **not** paint the control's own error border, because
Field can't know the control's styling prop name. Pair `state="error"` with the control's own
`invalid` prop (e.g. `<TextField invalid />`) so the message and the border agree. This mirrors the
separation the rest of the system uses: the wrapper handles semantics/labelling, the control handles
its own visual state.

## Context and size

`context` and `size` are coupled, matching Figma's own variant model (`size=all` for the default
context; `size=lg` and `size=sm/md` only for the inline context):

- `context="default"` aligns the label and message with the control's outer edge. It is
  **size-independent** - every control size renders identically (this is Figma's single `size=all`
  default variant).
- `context="inline"` does two things, because Figma models `context` as one shared axis across the
  whole field: (a) it indents the label and message to line up with the text *inside* the control -
  by the control's own inner start padding for the size, `lg` by `--spacing-md`, `sm` and `md`
  sharing `--spacing-sm` - and (b) it renders the **control itself inline** (borderless) by giving
  it `appearance="subtle"`, so the field reads as one inline unit. The control's own `appearance`
  still wins if it sets one.

So `size` only does anything in the inline context, purely to achieve that text alignment; it never
resizes the control (set the control's own `size` too). Because inline is about a borderless control
whose inner text the label lines up with, `context="inline"` is meant for text-bearing controls -
Text Field, Select, Text Area, and the date/time pickers, all of which take `appearance="subtle"` -
and has no meaningful effect on controls without inner text such as Checkbox, Switch, or Radio (use
`context="default"` for those).

## Anatomy

- **label** - a native `<label htmlFor>` at `--typography-heading-xxs`, `--color-content-subtle`,
  with an optional decorative `*` (`--color-content-error`) when `required`. This is a quiet form
  label distinct from the pill/overline-style Label atom.
- **control** - the wrapped control (the slot), rendered as-is at the container's edge.
- **message** - a `--typography-body-sm` line at `--color-content-subtle` (default),
  `--color-content-error` (error) or `--color-content-success` (valid), preceded by a decorative sm
  status icon on error/valid.

Related components: Text Field, Text Area, and Select (the controls Field wraps); Label (the
standalone pill label atom); Inline Message and Section Message (standalone messages).
