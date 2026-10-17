# Inline Message Component Checklist

## Component Information

### Name
Inline Message

### Tier
Molecule

### Related Components
- Popup
- Tooltip

---

## Purpose

### What problem does this component solve?
Shows a short, tone-colored status line inline in the page, with optional additional detail
revealed in a popup on click, without requiring a separate banner or dialog.

### Why does it need to exist?
Some status messages need more explanation than fits on one line, but that explanation is
supplemental enough that it shouldn't always be visible or take up permanent layout space.

### What user goal does it support?
- Scan a short status line at a glance.
- Optionally get more detail on demand, without navigating away or opening a separate dialog.

---

## Usage

### Where will this component be used?
- Form validation summaries
- Save/sync confirmations
- Any short inline status line that sometimes needs more explanation

### When should this component NOT be used?
- As a hover-only supplemental hint (use Tooltip)
- For content essential to completing a task with no fallback if the detail panel is never opened
- As a page-level banner or toast

---

## Content

### What content can be displayed?
- `title`: required bold lead text
- `secondaryText`: optional muted trailing text
- `content`: optional detail revealed in a popup on click

### Character Limits
No fixed limit on `title`/`secondaryText` - keep them short enough for one line. Keep `content`
short too: Popup's default panel is `max-content` wide with no maximum, so a long line doesn't wrap.

---

## Variants

### Tone
- `default`
- `information` (`info`, the earlier name, is still accepted)
- `success`
- `warning`
- `error`

---

## Accessibility Requirements

- [ ] Render a real `<button type="button">` when `content` is provided.
- [ ] Do not open on hover or focus - click/keyboard-activation only.
- [ ] Rely on Popup's own `aria-expanded`/`aria-controls` wiring - do not duplicate it.
- [ ] Apply the shared Focus Ring primitive to the trigger button - do not write a one-off focus
      style.
- [ ] Keyboard focus (`:focus-visible`) shows the same tint as hover, not a separate treatment.
- [ ] Render a plain, non-interactive row (no button) when `content` is omitted.
- [ ] Icon is always `aria-hidden`.
- [ ] Tone is never communicated by color alone - the icon and/or message text also carry it.

## Interaction Requirements

- [ ] Clicking the row toggles the detail popup open/closed.
- [ ] Supports controlled (`open`/`onOpenChange`) and uncontrolled (`defaultOpen`) usage.
- [ ] The detail panel dismisses on Escape and on an outside click, inherited from Popup's own
      defaults - the same as clicking the row again.
- [ ] Opening moves focus into the popup (a non-modal dialog named by the title) on the first open
      too: the focus waits a frame for Popup to position and show the panel. Tab past its last item,
      Shift+Tab before its first, or Escape returns focus to the row.

## Design Decisions

- Built on top of `Popup`, using Popup's **default styled skin** (not `unstyled`) - the first
  component in the system to do so; Tooltip only exercises `unstyled`.
- Click-to-toggle, not hover - resolved this way specifically because Popup's own docs reserve
  hover-only reveals for Tooltip. See "Design Decisions Beyond the Literal Figma Sample" in
  `inline-message-spec.md` for the full reasoning against Figma's ambiguous `hovered/open` state
  naming.
- `tone="default"` renders a plain CSS dot, not a fabricated status icon - no matching icon exists
  in the generated set, and Figma's own `default`-tone trigger uses an unrelated placeholder glyph
  too.

## Dependencies

- React
- TypeScript
- CSS Modules
- Popup primitive
- Icon primitive (StatusInformationIcon, StatusSuccessIcon, StatusWarningIcon, StatusErrorIcon)
- Design tokens generated from Figma
- Storybook
- Vitest
- React Testing Library

## Open Risks / Watchouts

- No `disabled` prop exists - if a real product need for one emerges, verify against Figma first
  rather than inventing behavior.

## Validated Figma Details

- `inline-message` component set: node `4589:2519`, file `Components v1.0.0`, variants `tone`
  (default/information/success/warning/error) x `isOpen`, the same names as code.
- `figma-parts / inline-message-trigger` sub-component: node `2448:72904`, properties `titleText`,
  `showTitle`, `secondaryText`, `showSecondaryText`, `tone`, `state`
  (default/hover-open/focus/press).
- Each tone's icon, icon color, and hover/open background tint verified directly from Figma's bound
  variables per tone (not assumed to generalize from the `info` sample) - see the Tone Mapping
  table in `inline-message-spec.md`.
- Row layout (24px icon container, 4px padding on both sides of the text group, 8px
  title-to-secondary-text gap, heading-xs title / body-md secondary text) verified directly from
  the trigger's own auto-layout data. The row itself (`.root`) carries no padding - a native
  `<button>` otherwise inherits the UA stylesheet's own default button padding (1px block / 6px
  inline in Chrome), so `.root` resets `padding` to `--spacing-none` explicitly.
- The popup's `alignment` property reads `"bottom left"` on every variant, mapping directly to
  Popup's `alignment="bottomLeft"`.
- Open state is read from the nested `popup` instance's own `isOpen` component property, not from the
  outer variant name.

## Examples to document

- [ ] Title only, no secondary text
- [ ] Title and secondary text together
- [ ] No `content` - a plain, non-interactive row
- [ ] In a form/composition context
- [ ] Controlled, opened programmatically after an action

## Storybook Requirements

Unified structure:

```txt
Inline Message / Docs (.mdx)
Inline Message / Playground
Inline Message / Variants
Inline Message / Content
Inline Message / EdgeCases
```

- **Variants** - all five tones, each with `content` provided.
- **Content** - title only, title + secondary text, no `content`, a form composition.
- **EdgeCases** - viewport-edge alignment fallback, long detail content, dark surface.
