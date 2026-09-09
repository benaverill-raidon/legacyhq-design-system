# Modal Dialog

Modal Dialog is an organism that interrupts the flow to focus the user on a single task or decision -
a confirmation, a short focused form, or content that needs acknowledgement. It renders a blanket
backdrop over the page and a centered panel with a header (title + close button), a scrollable body,
and a footer for the actions, and it owns the modal behaviour: it portals above the page, traps
focus, closes on Escape or a backdrop click, locks page scroll, and returns focus to whatever opened
it.

It's an organism because it composes atoms (Icon Button, the footer's Buttons, the status Icon) into
a complete, self-contained overlay with real interaction and accessibility responsibilities.

Use Modal Dialog for a decision the user must resolve before continuing - especially a destructive
one - or a short focused task. Do not use it for non-blocking transient feedback (that's Toast), for
contextual overflow anchored to a control (Dropdown Menu / Menu), or for a large or multi-step flow
(prefer a full page - a modal is for one focused task).

## Controlled, and it never closes itself

Modal Dialog is controlled: pass `open` and an `onClose`. Every close path - the close button,
Escape, and a backdrop click - calls `onClose`, and the consumer sets `open` to false in response.
This keeps the dialog a pure function of `open` and lets the consumer intercept a close (e.g. to
confirm discarding unsaved changes) before it happens.

## What it handles for you

The value of Modal Dialog is the overlay behaviour, done once and correctly:

- **Portal.** Renders into `document.body`, above the page, so it isn't clipped or stacked under
  sibling content.
- **Focus management.** Moves focus into the panel on open, traps Tab / Shift+Tab inside it, and
  restores focus to the element that opened it on close. Pass `initialFocusRef` to focus a specific
  element instead of the panel.
- **Dismissal.** Escape (`closeOnEscape`, default on) and a genuine backdrop click
  (`closeOnBackdropClick`, default on; a drag that merely ends on the backdrop does not close it).
- **Scroll lock.** Locks page scroll while open; the body scrolls internally when it is taller than
  the viewport allows, with the header and footer pinned.
- **Semantics.** `role="dialog"` + `aria-modal="true"`, named by the `title` (`aria-labelledby`) or,
  without a visible title, by `aria-label`; described by the `description` (`aria-describedby`) when
  one is provided.

## Title and description

The header holds a `title` (the heading and accessible name) and an optional `description` - a
supporting `body-md` line below the title that gives one-sentence context ("Archived projects can be
restored at any time"). When present, the description is wired as the dialog's `aria-describedby`.
Keep it to a sentence; longer explanation belongs in the body.

## Appearance

`appearance` (`default` / `warning` / `error`) prepends a decorative status icon to the title in the
matching colour. It deliberately does **not** tone the footer buttons - Modal Dialog can't know the
action layout - so pair `appearance="error"` with a matching Confirm button (e.g. `<Button
appearance="primary" tone="error">Delete</Button>`), the same wrapper-vs-control split Field uses for
`state`.

## Widths and content

Four widths - `small` (400px), `medium` (600px, default), `large` (752px), `extraLarge` (968px) -
confirmed from Figma. The panel shrinks to fit narrow viewports. The footer is a slot: pass the
actions (typically Cancel + Confirm) and they render right-aligned; omit it for an informational
dialog. It accepts any content, but it's built to hold actions - the Figma footer's preferred-slot
list is Button, Icon Button, Link, Link Button, Split Button, Toggle Button, and Toggle Icon Button.

## Anatomy

- **backdrop** - a fixed blanket filling the viewport
  (`--color-background-brand-secondary-overlay-blanket`) that centers the panel, with a
  `--spacing-4xl` inset keeping it off the edges.
- **panel** - `role="dialog"`, `--color-elevation-surface-raised-default` surface,
  `--border-radius-xxl` (16px), `--color-border-default` border. A flex column of header, body,
  footer.
- **header** - a column of a title row (status icon for warning/error + title
  `--typography-heading-md`, `--color-content-default` + close Icon Button) and an optional
  description below (`--typography-body-md`, `--color-content-default`), column gap `--spacing-sm`;
  padding `--spacing-2xl`/`--spacing-lg`.
- **body** - the scrollable content slot (`--typography-body-md`), inset by `--spacing-2xl`.
- **footer** - right-aligned actions, gap `--spacing-sm`; padding `--spacing-lg`/`--spacing-2xl`.

Related components: Button (footer actions), Toast (non-blocking feedback), Dropdown Menu / Menu
(contextual overflow).
