# Modal Dialog

## Overview

### Purpose
Interrupt the flow to focus the user on a single task or decision, over a backdrop, with the modal
behaviour (portal, focus trap, dismissal, scroll lock) handled.

### Description
A controlled overlay: a blanket backdrop centering a panel of header (title + close), a scrollable
body, and a footer of actions. The consumer owns `open` and reacts to `onClose`.

### Category
Organism - composes atoms (Icon Button, Buttons, status Icon) into a complete self-contained overlay
with interaction and accessibility responsibilities.

### Design Reference
- Figma file `Components v1.0.0` (`M0eINB6n1BfrXu7ntYqb1i`), page "Modal Dialog" (marked done ✅).
- `modal-dialog` component set (node `2456:12608`): `appearance` (default/warning/error) x `width`
  (small/medium/large/extra large) = 12 variants. Assembled from `modal-header` (set `2456:2409`,
  appearance default/warning/error) + a `<modal-body>` slot + `modal-footer` (set `2456:11691`,
  appearance default/warning/error), over a `blanket` backdrop instance.
- Panel widths (inner): small 400, medium 600, large 752, extraLarge 968. Verified live 2026-09-09.
- `modal-header` props: `titleText`, `descriptionText` + `showDescription`, `Close` (BOOLEAN),
  `showChipGroup`, `appearance`. The header is a vertical stack (gap spacing/sm): a title row and an
  optional description (body/md, content/default) below. Warning/error prepend a status icon
  (StatusWarningIcon / StatusErrorIcon) coloured content/warning / content/error; the title stays
  content/default. `showChipGroup` (off by default) is a niche chip row in place of the title - not
  built as a dedicated code prop.
- `modal-footer`: a right-aligned action group (Cancel + Confirm) whose Confirm tone follows the
  appearance (primary/warning/error). Those buttons are example content - the code footer is a slot
  the consumer fills, setting the Confirm tone to match.

---

## Usage Guidelines

### Use When
- A decision/confirmation the user must resolve before continuing (especially destructive).
- A short focused task, or content that needs acknowledgement.

### Do Not Use When
- Non-blocking transient feedback (use Toast).
- Contextual overflow anchored to a control (use Dropdown Menu / Menu).
- A large or multi-step flow (prefer a full page).

---

## Anatomy

```text
ModalDialog (portal -> document.body)
└─ div.backdrop (fixed inset 0, blanket, flex center, padding --spacing-4xl)
   └─ div.panel (role=dialog, aria-modal, aria-labelledby/label, tabIndex -1, width_*)
      ├─ div.header (flex column, padding 24/24/16, gap --spacing-sm)  [when title, description, or close]
      │  ├─ div.titleRow (flex, gap --spacing-lg)
      │  │  ├─ div.titleArea (flex, gap --spacing-sm)
      │  │  │  ├─ span.statusIcon (aria-hidden; warning/error only; md Icon)
      │  │  │  └─ h2.title (#id, --typography-heading-md)
      │  │  └─ IconButton (subtle, sm, aria-label=closeLabel)     [showCloseButton]
      │  └─ p.description (#id, --typography-body-md)              [when description]
      ├─ div.body (flex 1, overflow-y auto, padding-inline --spacing-2xl)
      └─ div.footer (flex, justify end, gap --spacing-sm, padding 16/24/24)  [when footer]
```

### Structure Notes
- The panel is a flex column: header and footer are `flex: 0 0 auto`; the body is `flex: 1 1 auto`
  with `overflow-y: auto`, so long content scrolls while header/footer stay pinned.
- The body's inset comes from the header's bottom padding and the footer's top padding; when either
  is absent, the body adds its own block padding (`data-has-header` / `data-has-footer`).
- The panel width shrinks with `max-inline-size: 100%`; the backdrop padding keeps it off the edges.

---

## Behaviour

- **Controlled.** `open` + `onClose`; the dialog never closes itself. Every close path (close button,
  Escape, backdrop) calls `onClose`.
- **Portal.** `createPortal` into `document.body`; renders nothing when `open` is false.
- **Focus.** On open, focus moves to `initialFocusRef` or the panel; Tab / Shift+Tab is trapped
  within the panel; on close (unmount), focus is restored to the previously-focused element.
- **Dismissal.** Escape (capture-phase keydown, `closeOnEscape`); a press-and-release on the backdrop
  itself (`closeOnBackdropClick`) - a drag that ends on the backdrop does not close it.
- **Scroll lock.** `document.body.style.overflow = 'hidden'` while open, restored on close.
- **Appearance.** `warning` / `error` prepend a decorative status icon to the title; does not tone
  the footer buttons.
- **Description.** `description` renders a `body-md` supporting line below the title row and is wired
  as the dialog's `aria-describedby`. The header renders whenever there's a title, description, or
  close button.

---

## Tokens

| Aspect | Token |
|---|---|
| Backdrop | `--color-background-brand-secondary-overlay-blanket` |
| Backdrop inset (panel off the edges) | `--spacing-4xl` |
| Panel surface | `--color-elevation-surface-raised-default` |
| Panel border | `--border-width-sm` `--color-border-default` |
| Panel radius | `--border-radius-xxl` (16px) |
| Panel widths | 400 / 600 / 752 / 968 px |
| Header padding | `--spacing-2xl` (top/l/r), `--spacing-lg` (bottom) |
| Header column gap (title row → description) | `--spacing-sm` |
| Title-row gap (title → close) / title-icon gap | `--spacing-lg` / `--spacing-sm` |
| Title typography | `--typography-heading-md-*`, `--color-content-default` |
| Description typography | `--typography-body-md-*`, `--color-content-default` |
| Status icon colour | `--color-content-warning` / `--color-content-error` |
| Body inset / typography | `--spacing-2xl` / `--typography-body-md-*` |
| Footer padding / action gap | `--spacing-lg` `--spacing-2xl` / `--spacing-sm` |

---

## Design Decisions

- **Built standalone, not on the Popup primitive.** Popup is a trigger-anchored, positioned popover
  with no focus trap, backdrop, `aria-modal`, or scroll lock. A modal is a centered, focus-trapped
  overlay, so it's implemented directly with `createPortal` + a focus trap rather than reusing Popup.
- **Controlled, `onClose`-only.** A modal only ever requests close; the consumer owns `open`. `onClose`
  (rather than Popup's `onOpenChange`) reads clearly and lets the consumer intercept a close.
- **`appearance` adds the status icon only, not the button tone.** Modal Dialog can't know the footer
  layout, so it colours the header icon and leaves the Confirm button's tone to the consumer - the
  same wrapper-vs-control split Field uses for `state` / the control's `invalid`.
- **Footer is a slot, right-aligned.** Figma's footer is a right-aligned action group (its left
  filter area is example content, hidden by default), so the footer is a slot the consumer fills.
  It's typed as `React.ReactNode` (holds anything), but the intended contents are actions: Figma's
  modal-footer action-group preferred-slot list is **Button, Icon Button, Link, Link Button, Split
  Button, Toggle Button, Toggle Icon Button** - usually a Cancel + a Confirm Button. (Figma's
  left-aligned info/filter area accepts a broader set - Avatar Group, Checkbox, Chip, Label, Progress
  Bar, Dropdown Menu, Spinner, Switch, Tag, etc. - which the code does not expose as a separate slot.)
- **Surface and backdrop inset use existing tokens by intent.** The panel surface is
  `--color-elevation-surface-raised-default` - the shared floating-surface token (Figma names the same
  role `overlay/default`). The backdrop fills the viewport; Figma's 64px around the panel was artboard
  framing, not a design value, so the code insets the panel with `--spacing-4xl`, an existing spacing
  token. No new tokens are required.

---

## Acceptance Criteria

- Renders nothing when `open` is false; portals a `role="dialog"` `aria-modal="true"` panel into the
  body when open.
- Named by `title` (`aria-labelledby`) or by `aria-label` when there's no title; described by the
  `description` (`aria-describedby`) when one is provided.
- Renders the `description` below the title row (`body-md`) when provided; renders the header for a
  description-only dialog.
- Close button, Escape (`closeOnEscape`), and a backdrop click (`closeOnBackdropClick`) each call
  `onClose`; a click inside the panel does not.
- Focus moves into the panel on open, is trapped on Tab, and is restored to the trigger on close.
- Page scroll is locked while open and restored on close.
- `warning` / `error` render a status icon; `default` renders none.
- `width` sets the panel width; the panel shrinks below it on narrow viewports.
- Renders a right-aligned footer when `footer` is provided; the body scrolls when tall.
- Composes `className` onto the panel; uses only semantic tokens; works in light and dark themes.
- Storybook includes Playground, Appearances, WithDescription, Widths, DestructiveConfirmation,
  ScrollingBody, and EdgeCases.
- Tests cover open/closed, portal + ARIA (incl. description / `aria-describedby`), all three close
  paths, focus move/trap/restore, scroll lock, appearance icon, width, and className.
