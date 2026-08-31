# Text Area

Text Area is the multi-line counterpart of [Text Field](../text-field/text-field.md): a real native
`<textarea>` inside the same bordered frame, for writing or editing content that spans several lines -
notes, descriptions, comments, message bodies. It shares Text Field's size, appearance, invalid, and
interaction-state treatment token-for-token, so the two read as one family.

It's grouped with Text Field as a molecule for that reason, even though it composes no other
component - the frame styling sits directly on the `<textarea>` element, since Text Area (unlike Text
Field) has no leading or trailing icon slots to arrange around the control. That also lets the
browser's native resize grip work with no extra wiring.

Use Text Area whenever someone needs to type genuinely multi-line free text. For a single-line value
use Text Field; for a value chosen from a fixed set of options use Select. Text Area is plain text
only - when the text needs to link to records, reach for
[Rich Text Area](../rich-text-area/rich-text-area.md), which implements Figma's
`type=rich-inline` mode (see below).

Text Area renders a real `<textarea>`, not a styled `<div>` pretending to be one, so native browser
behavior - keyboard entry, wrapping, autofill, copy/paste, spellcheck, scrolling, screen reader
support - all keep working for free. It has no attached label of its own; pair it with a native
`<label htmlFor>` (or `aria-label`) the same way you would with any native form control. A future
"Form Field" pattern composing a label, the control, and helper/error text is a natural next step
once there's a real use case - the same note Text Field carries - but isn't part of this component.

## Size, appearance, and states

- **`size`** (`md` / `lg`) controls padding, corner radius, and font size - `body-md` typography at
  md, `body-lg` at lg, radius stepping up to `xl` at lg. Confirmed per size directly from Figma. (The
  `sm` size was removed - it read almost identically to md.)
- **`appearance`** (`default` / `subtle`) is the same axis Text Field exposes (Figma names it `tone`).
  `default` is the standard bordered box, rounded on all four corners. `subtle` has no visible border
  or background until it's hovered, focused, or invalid - only a bottom accent line reveals, and its
  bottom corners stay square. Use `subtle` for a low-chrome area that shouldn't compete with
  surrounding content until someone interacts with it.
- **`invalid`** sets `aria-invalid` and paints the error border. Like Text Field, focus and invalid
  replace the border color and paint the thicker (2px) edge with an inset box-shadow rather than a
  real border-width change - so the multi-line text never shifts by a pixel on focus/blur or when the
  invalid state toggles.
- Hover, focus, typing, filled, and autofill are live states, not props. A documentation-only
  `data-force-state` pin mirrors the hover/focus pseudo-classes for a static Storybook reference, the
  same convention Text Field, Button, and Checkbox use.

## Resizing

**`resize`** (`none` / `vertical` / `horizontal` / `both`, default `vertical`) maps directly to the
CSS `resize` property. `vertical` is the sensible default - it lets content grow downward without a
drag breaking the surrounding layout horizontally. Use `none` to lock the height in a fixed layout;
content still scrolls natively when it overflows. A disabled field cannot be resized.

Set **`rows`** (the native attribute) to give the field a sensible initial height for the content you
expect; the field grows from there via typed content and the resize grip. There is no built-in
auto-resize-to-content behavior in this version.

## `type=rich-inline` lives in Rich Text Area

Figma's second `type`, `rich-inline`, is an **inline entity-tagging** mode - not rich-text formatting.
While typing, a user presses **`/`** to open a searchable, grouped picker of entities to link, and
each choice is inserted inline as a **navigational tag** - a colored, icon-bearing chip that links to
that record. It looks identical to `default` in the static mockup; the whole difference is behavior.

It ships as its own component, [Rich Text Area](../rich-text-area/rich-text-area.md), rather than as a
`type` prop here. The two share this frame token-for-token, but nothing else: Text Area is a native
`<textarea>` holding a string, while Rich Text Area is a `contenteditable` surface holding a
structured node array, plus a search callback and an entity-to-tone config. One component carrying
both would have meant two disjoint prop sets and two disjoint values behind a single name - so Text
Area exposes no `type` prop, and the illegal state still can't be requested.

Related components: [Text Field](../text-field/text-field.md) (single-line free text),
[Select](../select/select.md) (choosing from a fixed set of options), and Label (for a trailing
unit/status pill, as Text Field uses).
