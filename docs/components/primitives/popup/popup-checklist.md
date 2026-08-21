# Popup Checklist

## Component Information

### Name
Popup

### Category
Primitive

### Related Components
- Tooltip (renders through Popup with `unstyled` + `manageTriggerAria={false}`)
- Inline Message (renders through Popup with its default styled skin + `manageTriggerAria` at its default)
- Menu (the panel content Dropdown Menu renders through Popup)
- Dropdown Menu (built on Popup with `padding="none"`, wrapping a Menu panel)

---

## Purpose

### What problem does this primitive solve?
Popup provides shared positioning and dismissal logic for any component that needs to show a
floating panel of content anchored to a trigger, so each one doesn't reimplement
`getBoundingClientRect` math and document-level Escape/outside-click listeners independently.

### Why does it need to exist?
Multiple components need a floating, anchored, dismissible panel. Tooltip originally hand-rolled a
local version of this for its own narrower non-interactive case; Popup generalizes it into a shared
primitive, and Tooltip has since been migrated to render through it (with `unstyled` and its own
dismissal semantics) instead of maintaining a second copy.

### What user goal does it support?
- See contextual, anchored content without losing their place on the page
- Dismiss that content quickly (Escape, clicking elsewhere) without hunting for a close button
- Interact with the content itself, unlike a tooltip

---

## Usage

### Where will this primitive be used?
- Inline Message
- Dropdown Menu (wraps a Menu panel, `padding="none"`)
- Any future component needing an anchored, dismissible floating panel

### What are the most common use cases?
- A click-to-open action menu anchored to a button
- A short confirmation or status message anchored to the action that triggered it

### When should this primitive NOT be used?
- Non-interactive hover/focus hints - use Tooltip, which already renders through Popup internally
- Content essential to task completion that the user can't afford to have scroll out of view

---

## Content

### What content can be displayed?
Anything - `content` is `React.ReactNode`, including interactive elements. Unlike Tooltip, Popup
content is not restricted to non-interactive material.

### Does it render children?
Yes - `children` is the single trigger element, cloned to receive a measurement ref and
`aria-expanded`/`aria-controls`. Popup does not attach open/close behavior to it.

---

## Variants

### Alignment
- topLeft (default, matches Figma)
- topRight
- topCenter
- bottomLeft
- bottomRight
- bottomCenter

### Padding
- none (0 - the consumer's own content manages all edge padding, e.g. Dropdown Menu's Menu panel)
- sm (`--spacing-sm`)
- md (`--spacing-md`)
- lg (`--spacing-lg`, default, matches Figma)

### Token Mapping
- Background: `--color-elevation-surface-raised-default`
- Border: `--border-width-sm` / `--color-border-default`
- Padding: `--spacing-sm` / `--spacing-md` / `--spacing-lg` (via the `padding` prop)
- Radius: `--border-radius-lg`
- Shadow: `--color-elevation-shadow-overlay-inner` / `-spread` / `-perimeter`
- Trigger-to-panel gap: `--spacing-sm`
- Inter-content gap: `--spacing-xs`

Background/border/radius/shadow/gap live in a separate `.panelSurface` class; padding lives in its
own `padding_sm`/`padding_md`/`padding_lg` class so it can vary independently. Both are skipped
entirely when `unstyled` is true - the base `.panel` class carries only structural positioning and
the mount animation.

---

## States

Required:
- Closed (default)
- Open
- Open, but hidden because the trigger has scrolled fully outside the viewport

Not required:
- Hover, active, loading - Popup is not itself interactive; the trigger and content own their own
  states.

---

## Accessibility

### Does this support keyboard navigation?
Escape dismisses by default (`closeOnEscape`). Popup does not manage focus movement into or out of
the panel - that's left to the consumer, since the right focus target depends on what's inside.

### What ARIA is applied?
By default (`manageTriggerAria=true`): `aria-expanded` on the trigger, and `aria-controls` on the
trigger pointing at the panel id while open. Set `manageTriggerAria={false}` when the consumer
already manages its own trigger ARIA (Tooltip's `aria-describedby`) - those attributes are
disclosure-widget semantics and don't apply to every consumer. No default `role` on the panel - the
consumer supplies one appropriate to what it's building.

### Is this an interactive component?
Popup itself renders no interactive control. Its trigger and content are supplied by the consumer
and remain responsible for their own semantics.

---

## Responsive Behavior

### Mobile
Positioning recalculates on resize/scroll, same as desktop. Outside-click dismissal uses
`pointerdown`, which fires for touch as well as mouse.

### Tablet
Same as desktop.

### Desktop
Alignment falls back automatically near a viewport edge rather than clipping.

---

## Dependencies

### What components does this depend on?
None.

### What components depend on it?
Tooltip, Inline Message, and Dropdown Menu (which wraps a Menu panel).

---

## Notes

Final implementation decisions:
- `open` is a required, fully controlled prop - no internal open state, no `defaultOpen`.
- Popup owns Escape/outside-click dismissal by default (`closeOnEscape`/`closeOnOutsideClick`,
  both `true`), calling `onOpenChange(false)` rather than changing its own visibility.
- `alignment` defaults to `topLeft`, matching Figma's own declared default variant.
- The panel hugs its content on both axes - no stretch-to-fill.
- No default ARIA role on the panel.
- `unstyled` (default `false`) skips Popup's own visual skin entirely, for a consumer with a
  different visual design (Tooltip).
- `padding` (default `'lg'`) sizes just the skin's padding without touching background/border/
  radius/shadow - for a consumer that shares Popup's skin but needs denser content (a menu's rows)
  or none at all (`'none'`, for a consumer whose content manages its own edge padding, e.g. Dropdown
  Menu). Ignored when `unstyled` is true.
- `manageTriggerAria` (default `true`) skips `aria-expanded`/`aria-controls` when a consumer already
  manages its own trigger ARIA (Tooltip's `aria-describedby`).
- The panel hides itself (not `open`) once the trigger scrolls fully outside the viewport, rather
  than clamping to the nearest edge - added after review found a dropdown menu visibly "stuck" at
  the viewport edge once its trigger scrolled out of view entirely.
