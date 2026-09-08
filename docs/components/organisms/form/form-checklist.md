# Form Checklist

## Component Information

### Name
Form

### Category
Organism

### Related Components
- Field (the building block Form arranges - label + control + message + validation state)
- Text Field, Select, Text Area (the controls a Field wraps)
- Button (the footer actions)

---

## Purpose

### What problem does this component solve?
Lays out a set of fields the user fills in and submits together - a real `<form>` with a header,
grouped/rowed fields, and a footer of actions - without each screen re-inventing the spacing and
structure.

### Why does it need to exist?
Fields (label + control + message) need a consistent container: a title, section grouping, multi-
column rows, and an actions footer. Form is that shared, native container.

### What user goal does it support?
- Understand what the form is for (its title) and which fields are required (the legend)
- Fill in related fields grouped sensibly, some side by side
- Submit or cancel from a predictable actions area

---

## Usage

### Where will this component be used?
- Any create/edit/settings/sign-up flow - wherever fields are submitted together

### What are the most common use cases?
- A titled single-section form with an end-aligned submit
- A multi-section settings form
- A form with two- or three-up rows of related fields

### When should this component NOT be used?
- A single standalone control (use Field or the bare control)
- A page section that isn't a form (use plain layout)

---

## Content

### What content can be displayed?
- Header: title, description, and/or the "* indicates a required field" legend
- Body: FormSections (optional titles) containing Fields and/or FormRows
- Footer: action Buttons, aligned end or start

### Character Limits
None - title/description/section titles wrap.

---

## Variants

### Parts
- Form (header + `<form>`), FormSection (grouped fields, optional title), FormRow (equal columns),
  FormFooter (actions, align end/start)

---

## States

Required:
- default (Form itself is stateless; native `<form>` submission)

Not Required:
- Form does not manage per-field state or validation - Field and the native control do.

---

## Accessibility

### Is it a real form?
Yes - Form renders a native `<form>`, so Enter-to-submit, `type="submit"` buttons, and browser
validation all work. Give the submit Button `type="submit"`.

### Who labels the fields?
Field does. Form does not re-wire labelling or descriptions.

### Is the section title a heading?
No - it's presentational text (matching Figma). Add a semantic heading in your page structure if a
group needs one.

### Is the required legend read out?
Yes - the legend sentence (including the `*`) is real content, not `aria-hidden`; only Field's own
required `*` marker is decorative.

---

## Open Questions
- The Figma source is work-in-progress (🚧): whether the title should be a semantic heading is
  unresolved. (The row column gap, once unset, is now `--spacing-lg` in Figma - matching the code.)
- Should Form later offer an opt-in responsive collapse of multi-column rows on narrow containers?

---

## Notes
Form is a thin layout organism - a native `<form>` + header + section/row/footer spacing - and owns
no form state. It ships as four separate exports (Form, FormSection, FormRow, FormFooter), matching
the repo's Tabs/TabPanel pattern rather than dot-notation compounds. All spacing lives on the blocks
(the `<form>` has no gap), so the layout reads correctly with or without a header. One work-in-
progress call remains, flagged in `form-spec.md`: the presentational (non-heading) title. See
`form-spec.md` for the full reasoning.
