# Generate Form Component

Use `form-spec.md` as the source of truth.

## Goal

Generate a production-ready Form component (an organism).

Form is a thin layout organism: a native `<form>` with an optional header (title, description,
required-field legend) that arranges its fields into sections and rows and puts the actions in a
footer. It composes Field (and its controls) via children; it owns no form state.

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
form/
├─ form.tsx           (Form + FormSection + FormRow + FormFooter)
├─ form.types.ts
├─ form.module.css
├─ Form.test.tsx
├─ Form.stories.tsx
├─ form.mdx
└─ index.ts
```

---

## Exports

Four separate named exports (matching the repo's Tabs/TabPanel pattern - no dot-notation compounds):
`Form`, `FormSection`, `FormRow`, `FormFooter`, plus their prop types.

---

## Anatomy

Native `<form>` (flex column, gap 0) rendering an optional header (title `heading/lg`, description
`body/md`, and a "* indicates a required field" legend with the `*` in `--color-content-error`),
then children: FormSections (padding-top `--spacing-3xl`, inner gap `--spacing-lg`, optional title
`heading/sm`) containing Fields and/or FormRows (equal columns, gap `--spacing-lg`), and a
FormFooter (padding-top `--spacing-4xl`, action gap `--spacing-sm`, `align` end/start).

---

## Behaviour

- Form renders a real `<form>`, forwards its ref (`HTMLFormElement`) and all native form attributes
  (`onSubmit`, `name`, `noValidate`, ...), and owns no form state.
- The header renders only when `title`, `description`, or `requiredLegend` is set.
- All inter-block spacing lives on the blocks (section/footer top padding), not on the `<form>`.
- FormRow makes each direct child an equal-width column (`flex: 1 1 0; min-inline-size: 0`).
- FormFooter uses `data-align` (`end`/`start`) -> `justify-content`.

---

## Do NOT

- Do NOT manage per-field validation state in Form - that's Field / the native control.
- Do NOT use dot-notation compounds (`Form.Section`) - ship separate exports.
- Do NOT hardcode spacing/typography/colour - use tokens.

---

## Work-in-progress source

The Figma Form page is marked 🚧. The `<form-row>` column gap is `--spacing-lg` (16px). One
unsettled call: the title is a Figma text node - render it as presentational text, not a semantic
heading. Flag it in the docs.

---

## Storybook

Include `Playground`, `Repository` (a realistic end-to-end form), `Sections`, `Rows`,
`FooterAlignment`, and `EdgeCases` (no header + dark surface).

---

## Tests

Cover: renders a native `<form>`; ref + native attribute forwarding; onSubmit; header title /
description / required legend (coloured `*`) and no-header case; FormSection title + top spacing;
FormRow equal columns; FormFooter default/`start` alignment; className composition; token usage.
