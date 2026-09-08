# Form

Form is a layout organism: a native `<form>` with an optional header (title, description, and the
"* indicates a required field" legend) that arranges its fields into sections and rows and puts the
actions in a footer. It owns the header and the spacing between blocks; the fields themselves come
from [Field](../../molecules/field/field.md) (wrapping a Text Field, Select, Text Area, ...) passed
in as children, and submission, validation, and each field's own state stay native and the
consumer's.

It's an organism because it composes molecules (Field and its controls) and lays out a complete UI
section. It is deliberately thin: it does not manage form state or validation - it renders a real
`<form>`, a header, and the section/row/footer layout, and gets out of the way.

Use Form whenever the user fills in and submits a set of fields together. Use Field (or a bare
control) directly for a single control that isn't part of a submitted set, and use plain layout for
a page section that isn't a form - Form renders a real `<form>` element.

## Parts

Form is four separately-exported parts, matching the Figma code-parts (`<form-header>`,
`<form-section>`, `<form-row>`, `<form-footer>`):

- **`Form`** - the native `<form>` plus the header (rendered from `title` / `description` /
  `requiredLegend`). Forwards its ref and all native form attributes (`onSubmit`, `name`,
  `noValidate`, ...).
- **`FormSection`** - a vertical group of fields with an optional heading. Adds the `--spacing-3xl`
  top gap that separates it from the header or the previous section, and spaces its own children by
  `--spacing-lg`.
- **`FormRow`** - lays its children out as equal-width columns on one line (up to 4 per Figma),
  separated by `--spacing-lg`. Fields placed directly in a section (not in a row) take the full
  width.
- **`FormFooter`** - the actions, below the body with a `--spacing-4xl` top gap. `align="end"`
  (default) right-aligns them; `align="start"` left-aligns them.

## Header

`title` renders at `--typography-heading-lg` and `description` at `--typography-body-md`, both
`--color-content-default`. `requiredLegend` renders the standard "* indicates a required field" line
with the `*` in `--color-content-error` - the same marker Field shows on a required field, so the
legend and the fields agree. The legend `*` is real content (not `aria-hidden`), since the sentence
is what explains the convention. Omit `title`, `description`, and `requiredLegend` and Form renders
no header.

## Spacing model

All spacing is confirmed from Figma's parts and lives on the blocks themselves (the `<form>` has no
gap of its own), so it reads correctly with or without a header:

- header title -> description: `--spacing-md` (12px)
- a section's top gap (header -> section, section -> section): `--spacing-3xl` (32px)
- within a section (title -> rows, row -> row, field -> field): `--spacing-lg` (16px)
- the footer's top gap: `--spacing-4xl` (40px); between footer actions: `--spacing-sm` (8px)
- between columns in a row: `--spacing-lg` (16px)

## Design note (work-in-progress source)

The Figma Form page is still marked work-in-progress (🚧). One call remains where the source is
unsettled:

- **Header title semantics.** The Figma title is a text node, so `title` renders as presentational
  text, not a semantic heading. Wrap the form in your page's heading structure, or pass a heading
  element as the `title` node, if you need one.

(The row column gap was previously unset in Figma; it has since been set to `--spacing-lg` (16px),
which the code already used, so it is no longer a judgment call.)

## Accessibility

- Form renders a real `<form>`, so native submission (Enter in a field, a `type="submit"` button)
  and browser validation work for free. Give the submit `Button` `type="submit"`.
- Each field's labelling and description come from Field - Form does not re-wire them.
- The section title is presentational; use a semantic heading in your page structure if a group
  needs one.

Related components: [Field](../../molecules/field/field.md) (the building block Form arranges), Text
Field / Select / Text Area (the controls a Field wraps), and Button (the footer actions).
