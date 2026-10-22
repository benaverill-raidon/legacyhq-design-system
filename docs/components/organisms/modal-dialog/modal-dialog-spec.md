# Modal Dialog

## Overview

### Purpose
Interrupt the flow to focus the user on a single task or decision, over a backdrop, with the modal
behaviour (portal, focus trap, dismissal, scroll lock) handled.

### Description
A controlled overlay: a blanket backdrop centering a panel of header (title + header actions), a
scrollable body, and a footer of actions. The consumer owns `open` and reacts to `onClose`.

### Tier
Organism - composes atoms (Icon Button, Buttons, status Icon) into a complete self-contained overlay
with interaction and accessibility responsibilities.

### Design Reference
- Figma file `Components v1.0.0` (`M0eINB6n1BfrXu7ntYqb1i`), page "Modal Dialog" (marked done ✅).
- `modal-dialog` component set (node `2456:12608`): `tone` (default/warning/error) x `width`
  (sm/md/lg/xl) = 12 variants. Assembled from `modal-header` (set `2456:2409`,
  tone default/breadcrumb/warning/error) + a `<modal-body>` slot + `modal-footer` (set
  `2456:11691`, tone default/warning/error), over a `blanket` backdrop instance.
- Panel widths (inner): sm 400, md 600, lg 752, xl 968 (the long names small/medium/large/extraLarge are deprecated aliases). Verified live 2026-09-08.
- `modal-header` props: `titleText`, `Close` (BOOLEAN), `showChipGroup`, `appearance`. Warning/error
  prepend a status icon (StatusWarningIcon / StatusErrorIcon) coloured content/warning / content/error;
  the title stays content/default.

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
      ├─ div.header (flex, padding 24/24/16, gap --spacing-lg)   [when title or header action]
      │  ├─ div.titleArea (flex, gap --spacing-sm)
      │  │  ├─ span.statusIcon (aria-hidden; warning/error only; md Icon)
      │  │  └─ h2.title (#id, --typography-heading-md)
      │  └─ headerActions: ButtonGroup(.headerActions) when both are shown, else the lone button
      │     ├─ IconButton (subtle, sm, aria-label=expandLabel, GrowDiagonalIcon)  [onExpand]
      │     └─ IconButton (subtle, sm, aria-label=closeLabel)        [showCloseButton]
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
- **Dismissal.** Escape (`closeOnEscape`), only when the dialog is the topmost open layer; a
  press-and-release on the backdrop itself (`closeOnBackdropClick`) - a drag that ends on the
  backdrop does not close it.
- **Naming.** Named by `title` (`aria-labelledby`) or `aria-label`; with neither, it warns in
  development (`console.warn`, skipped when `import.meta.env.PROD`), as Icon Button does.
- **Scroll lock.** `document.body.style.overflow = 'hidden'` while open, restored on close.
- **Tone.** `warning` / `error` prepend a decorative status icon to the title; does not tone
  the footer buttons.
- **Header actions.** The header ends with the close button; pass `onExpand` to add an Expand
  (maximize) button before it. When both are shown they share a Button Group; a lone button renders
  on its own. `expandLabel` / `closeLabel` set their accessible names (and tooltips).

---

## Tokens

| Aspect | Token |
|---|---|
| Backdrop | `--color-background-brand-secondary-overlay-blanket` |
| Backdrop inset (panel off the edges) | `--spacing-4xl` |
| Panel surface | `--color-elevation-surface-raised-default` |
| Panel border | `--border-width-sm` `--color-border-default` |
| Panel radius | `--border-radius-xxl` (16px) |
| Panel shadow | `--elevation-shadow-overlay` |
| Entrance | `--fade-quick`: the backdrop fades in; the panel fades in and rises 8px (local keyframes). Skipped under reduced motion |
| Panel widths | 400 / 600 / 752 / 968 px |
| Header padding | `--spacing-2xl` (top/l/r), `--spacing-lg` (bottom) |
| Header gap / title-icon gap | `--spacing-lg` / `--spacing-sm` |
| Header action gap (expand ↔ close) | `--spacing-sm` (via the header Button Group) |
| Title typography | `--typography-heading-md-*`, `--color-content-default` |
| Status icon colour | `--color-content-warning` / `--color-content-error` |
| Body inset / typography | `--spacing-2xl` / `--typography-body-md-*` |
| Footer padding / action gap | `--spacing-lg` `--spacing-2xl` / `--spacing-sm` |

The backdrop's `z-index` is set inline from `LAYERS.dialog` (1000) in `primitives/layers.ts`, the
one place the overlay stacking order lives. Popup-based components (Tooltip, Dropdown Menu, the
pickers, Inline Message) render at `LAYERS.popup` (1200), so inside a dialog they appear above it,
including the default tooltips of the header's Close and Expand Icon Buttons. `LAYERS.toast` (1100)
puts toasts between the two.

Escape: the dialog registers as a layer with `useLayer` from `primitives/layers.ts`, the stack
Popup uses too, and listens on `document` in the bubble phase. It calls `onClose` only when it's
the topmost open layer and nothing has already handled the key (`preventDefault()`), and claiming
the key calls `preventDefault()` itself. So Escape in an open Dropdown Menu, picker, or tooltip in
the dialog closes that first, and with two stacked dialogs only the top one closes. A control that
handles Escape itself without `preventDefault()` (Inline Edit's cancel) still lets the dialog close
too. The Tab focus trap stays a capture-phase listener. Layers order by when they open, so a popup
and a dialog that both mount open in the same render order child-first (the popup under the dialog).
There's no exit animation, by decision (2026-10-20): the dialog unmounts when `open` is false and
leaves at once, as the motion rules have every overlay but Toast Group do (token-governance.json
`motion.overlays`). It's not an open question.

The component returns its portal wrapped in a fragment. That adds nothing to the DOM; react-docgen
(Storybook's docgen) doesn't recognize a function that returns a bare `createPortal(...)` call as a
component, and the Docs page's API table is generated from it.

---

## Design Decisions

- **Built standalone, not on the Popup primitive.** Popup is a trigger-anchored, positioned popover
  with no focus trap, backdrop, `aria-modal`, or scroll lock. A modal is a centered, focus-trapped
  overlay, so it's implemented directly with `createPortal` + a focus trap rather than reusing Popup.
- **Controlled, `onClose`-only.** A modal only ever requests close; the consumer owns `open`. `onClose`
  (rather than Popup's `onOpenChange`) reads clearly and lets the consumer intercept a close.
- **`tone` adds the status icon only, not the button tone.** Modal Dialog can't know the footer
  layout, so it colours the header icon and leaves the Confirm button's tone to the consumer - the
  same wrapper-vs-control split Field uses for `state` / the control's `invalid`.
- **Footer is a slot, right-aligned.** Figma's footer is a right-aligned action group (its left
  filter area is example content, hidden by default), so the footer is a slot the consumer fills with
  Buttons.
- **Surface and backdrop inset use existing tokens by intent.** The panel surface is
  `--color-elevation-surface-raised-default`, with the overlay elevation shadow
  (`--elevation-shadow-overlay`), as Figma's panel binds `elevation/surface/raised/default` and the
  `elevation.shadow.overlay` effect style. The backdrop fills the viewport; Figma's 64px around the panel was artboard
  framing, not a design value, so the code insets the panel with `--spacing-4xl`, an existing spacing
  token. No new tokens are required.

---

## Acceptance Criteria

- Renders nothing when `open` is false; portals a `role="dialog"` `aria-modal="true"` panel into the
  body when open.
- Named by `title` (`aria-labelledby`) or by `aria-label` when there's no title.
- Close button, Escape (`closeOnEscape`), and a backdrop click (`closeOnBackdropClick`) each call
  `onClose`; a click inside the panel does not.
- Focus moves into the panel on open, is trapped on Tab, and is restored to the trigger on close.
- Page scroll is locked while open and restored on close.
- `warning` / `error` render a status icon; `default` renders none.
- `width` sets the panel width; the panel shrinks below it on narrow viewports.
- Renders a right-aligned footer when `footer` is provided; the body scrolls when tall.
- Shows an Expand button (grouped with Close in a Button Group) when `onExpand` is provided; none by
  default.
- Composes `className` onto the panel; uses only semantic tokens; works in light and dark themes.
- Storybook includes Playground, Tones, Widths, DestructiveConfirmation, ScrollingBody,
  HeaderExpand, and EdgeCases.
- Tests cover open/closed, portal + ARIA, all three close paths, the expand button and its grouping,
  focus move/trap/restore, scroll lock, tone icon, width, and className.
