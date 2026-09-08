# Generate Modal Dialog Component

Use `modal-dialog-spec.md` as the source of truth.

## Goal

Generate a production-ready Modal Dialog component (an organism).

Modal Dialog is a controlled overlay: a blanket backdrop centering a panel of header (title + close),
a scrollable body, and a footer of actions. It portals above the page, traps focus, closes on
Escape / backdrop, locks page scroll, and restores focus to the trigger.

---

## Framework

- React
- TypeScript

---

## Styling

- CSS Modules
- CSS Variables only
- Use generated token CSS
- No hardcoded colours/spacing/radius/typography (panel px widths and z-index are not token-gated)

---

## Expected Files

```txt
modal-dialog/
├─ modal-dialog.tsx
├─ modal-dialog.types.ts
├─ modal-dialog.module.css
├─ ModalDialog.test.tsx
├─ ModalDialog.stories.tsx
├─ modal-dialog.mdx
└─ index.ts
```

---

## Props

- `open: boolean`, `onClose: () => void` (controlled - never closes itself)
- `title?: React.ReactNode` (heading + accessible name), `aria-label?` (name when no title)
- `appearance?: 'default' | 'warning' | 'error'` (prepends a status icon; does NOT tone footer buttons)
- `width?: 'small' | 'medium' | 'large' | 'extraLarge'` (400 / 600 / 752 / 968 px)
- `children` (body), `footer` (right-aligned actions slot)
- `showCloseButton?` (default true), `closeLabel?` (default "Close")
- `closeOnEscape?` (default true), `closeOnBackdropClick?` (default true)
- `initialFocusRef?`, `className?`

---

## Behaviour (the important part)

- `createPortal` into `document.body`; render null when closed or on the server.
- `role="dialog"` + `aria-modal="true"`; `aria-labelledby` the title or `aria-label`.
- Focus: move into the panel on open (initialFocusRef or the panel, tabIndex -1), trap Tab /
  Shift+Tab within it, restore focus to the previously-focused element on close.
- Dismissal: Escape (capture-phase keydown, closeOnEscape) and a genuine press-and-release on the
  backdrop (closeOnBackdropClick) - a drag ending on the backdrop must not close it.
- Scroll lock: set `document.body.style.overflow = 'hidden'` while open, restore on close.
- `appearance` warning/error prepend a decorative (aria-hidden) status icon coloured
  content/warning / content/error; the title stays content/default.

---

## Do NOT

- Do NOT build on the Popup primitive - it is a positioned popover with no focus trap / backdrop /
  scroll lock.
- Do NOT tone the footer buttons from `appearance` - the consumer pairs the Confirm button tone.
- Do NOT let the dialog manage its own open state - it is controlled.

---

## Tokens to note

The Figma page is done (✅). The panel surface is the shared floating-surface token
`--color-elevation-surface-raised-default` (Figma names the same role `overlay/default`). The backdrop
fills the viewport; Figma's 64px around the panel was artboard framing, so inset the panel with
`--spacing-4xl` (an existing spacing token), not a 64px value.

---

## Storybook

Include `Playground`, `Appearances`, `Widths`, `DestructiveConfirmation`, `ScrollingBody`, and
`EdgeCases` (no footer + aria-label-only). Each story opens the modal from a trigger button holding
local open state.

---

## Tests

Cover: renders nothing when closed; portal + role/aria-modal + accessible name (title and aria-label);
footer render; all three close paths (close button, Escape, backdrop) + no-close on inside click and
when disabled; focus move into the panel, trap, and restore to the trigger; scroll lock/restore;
appearance status icon; width class; className composition; token usage.
