# Form

## Overview

### Purpose
Lay out a set of fields the user fills in and submits together - a native `<form>` with a header,
grouped/rowed fields, and a footer of actions.

### Description
Form is a thin layout organism. It renders the `<form>` element, an optional header (title,
description, required-field legend), and the spacing between section/row/footer blocks. The fields
come from Field (wrapping Text Field, Select, Text Area, ...) passed as children; submission,
validation, and each field's own state stay native and the consumer's.

### Category
Organism - it composes molecules (Field and its controls) into a complete UI section. Exported as
four related parts (Form, FormSection, FormRow, FormFooter), the same separate-export pattern Tabs
(Tabs + TabPanel) uses rather than dot-notation compounds.

### Design Reference
- Figma file `Components v1.0.0` (`M0eINB6n1BfrXu7ntYqb1i`), page "Form" (marked work-in-progress 🚧).
- `form` component set (node `2849:9088`), variant axis `sections` (1/2/3) - the number of section
  groups; in code this is just however many `FormSection`s the consumer renders, not a prop.
- Assembled from code-parts: `<form-header>` (node `2215:66090`), `<form-section>` (node `2216:725`),
  `<form-row>` (set `4800:124906`, variant `number of slots` 1-4), `<form-footer>` (set `2216:1668`,
  variant `align` start/end).
- `<form-header>` component properties: `show title` / `show description` (BOOLEAN), `title` /
  `description` (TEXT), `show content` (BOOLEAN, default false) + a content slot.
- `<form-section>`: `showTitle` (BOOLEAN, default false) + `titleText` (TEXT).
- Each `<form-row>` slot is a VERTICAL SLOT (holds one Field); the footer is a single SLOT aligned
  start/end. Verified live 2026-09-08.

---

## Usage Guidelines

### Use When
- The user fills in and submits a set of fields together.

### Do Not Use When
- A single control stands alone - use Field (or the bare control) directly.
- The content is a page section that isn't a form - use plain layout (Form renders a real `<form>`).

---

## Anatomy

```text
Form (form.root, native <form>, flex column, gap 0)
├─ div.header (optional; flex column, gap --spacing-md)
│  ├─ div.title        (title, --typography-heading-lg)
│  ├─ p.description     (description, --typography-body-md)
│  └─ p.description     (requiredLegend: <span.requiredMark>*</span> indicates a required field)
├─ {children}
│  ├─ FormSection (div.section, padding-top --spacing-3xl, flex column gap --spacing-lg)
│  │  ├─ div.sectionTitle (optional, --typography-heading-sm)
│  │  ├─ Field ...            (single-column field)
│  │  └─ FormRow (div.row, flex, gap --spacing-lg; > * flex:1 1 0)
│  │     ├─ Field ...         (equal column)
│  │     └─ Field ...         (equal column)
│  └─ FormFooter (div.footer, padding-top --spacing-4xl, flex gap --spacing-sm, data-align)
│     └─ Button ...           (actions)
```

### Structure Notes
- The `<form>` itself has no gap; each block owns its own top spacing, so the layout is correct with
  or without a header.
- `FormRow` makes each direct child an equal-width column (`flex: 1 1 0; min-inline-size: 0`).
- `FormFooter` uses `data-align` (`end`/`start`) -> `justify-content: flex-end`/`flex-start`.

---

## Tokens

| Aspect | Token |
|---|---|
| Header title typography | `--typography-heading-lg-*`, `--color-content-default` |
| Header description typography | `--typography-body-md-*`, `--color-content-default` |
| Required legend `*` colour | `--color-content-error` |
| Header title -> description gap | `--spacing-md` (12px) |
| Section top gap | `--spacing-3xl` (32px) |
| Section internal gap (title/rows/fields) | `--spacing-lg` (16px) |
| Section title typography | `--typography-heading-sm-*`, `--color-content-default` |
| Row column gap | `--spacing-lg` (16px) |
| Footer top gap | `--spacing-4xl` (40px) |
| Footer action gap | `--spacing-sm` (8px) |

---

## Design Decisions

- **Thin layout organism, not a form-state manager.** Figma's Form is pure layout + slots, and the
  system already puts labelling/description/validation on Field and native behaviour on the control.
  So Form renders a real `<form>` (native submission and validation for free) and the block layout,
  and owns no form state. This keeps it composable and matches the "native elements first" rule.
- **Four separate exports, not dot-notation compounds.** The repo has no `X.Y` compound components;
  multi-part components ship as separate named exports (Tabs + TabPanel, RadioGroup + Radio). Form
  follows that with Form / FormSection / FormRow / FormFooter in one directory and one doc set.
- **Header baked into Form; section/row/footer are children.** The `<form-header>` is always the
  form's own header, so it's rendered from `title`/`description`/`requiredLegend` props rather than a
  separate export. The repeatable, content-bearing parts (sections, rows, footer) are children.
- **Spacing lives on the blocks, form gap is 0.** Matching Figma (section `padding-top` 32, footer
  `padding-top` 40), the `<form>` has no gap of its own, so a header-less form has no wasted leading
  space.
- **Fields can sit directly in a section OR in a row.** Figma always nests rows in sections; in code
  a single-column field can also be a direct section child (the section's own gap spaces it), which
  is the common case and avoids a mandatory one-slot row.
- **Work-in-progress source.** The Figma page is still 🚧. The `<form-row>` column gap was initially
  unset (`0`); it has since been set to `--spacing-lg` (16px) in Figma, matching what the code
  already used, so it is no longer a judgment call. One call remains: the Figma title is a text node,
  so `title` renders as presentational text, not a semantic heading - documented so consumers add
  their own heading structure if needed.

---

## Acceptance Criteria

- Form renders a native `<form>` and forwards its ref and native attributes (`onSubmit`, `name`,
  `noValidate`, ...).
- Renders the header from `title` / `description` / `requiredLegend`; the legend shows a coloured
  `*` and reads "* indicates a required field"; no header renders when all three are absent.
- FormSection renders an optional title and adds `--spacing-3xl` top spacing.
- FormRow lays its children out as equal-width columns.
- FormFooter defaults to `align="end"` and supports `align="start"` via `data-align`.
- Composes `className` on every part (plus `headerClassName` / `titleClassName`).
- Uses only semantic tokens; works in light and dark themes.
- Storybook includes Playground, Repository, Sections, Rows, FooterAlignment, and EdgeCases.
- Tests cover the native form + submit + ref/attrs, header/legend, sections, rows, and footer
  alignment.
