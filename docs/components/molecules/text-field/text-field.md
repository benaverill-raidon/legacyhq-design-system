# Text Field

Text Field is a molecule that lets a user write or edit a single line of text. It renders a real
native `<input>` inside a bordered frame, composes an optional leading icon/text slot and an
optional trailing icon/action slot around it, and is the foundation for every free-text entry
point in the product - names, emails, search boxes, quantities, and so on.

It's a molecule rather than an atom because its trailing slot can compose a real Icon Button or
Button - it isn't just the bare native input plus decoration anymore.

Use Text Field wherever someone needs to type a short, single-line value. Use the native `type`
attribute (`text`, `email`, `password`, `search`, `tel`, `url`, `number`, ...) to get the right
keyboard and built-in browser validation for the data being collected, rather than validating
everything as plain text yourself.

Do not use Text Field for multi-line content - there is no `textarea` mode. Do not use it for a
value chosen from a fixed set of options - use Select for that. Do not build a segmented "OTP" or
multi-box input out of several Text Fields side by side without real justification; a single field
is almost always right.

Text Field renders a real `<input>`, not a styled `<div>` pretending to be one, so native browser
behavior - keyboard entry, autofill, copy/paste, spellcheck, built-in validation UI, screen reader
support - all keep working for free. It has no attached label of its own; Figma's source component
is the bare input frame only, so pair it with a native `<label htmlFor>` (or `aria-label`) the same
way you would with any native form control. A future "Form Field" pattern composing a label, this
input, and helper/error text is a natural next step once there's a real use case for it, but isn't
part of this component today.

The `appearance="subtle"` variant has no visible border or background until it's hovered, focused,
or invalid, and its bottom corners are always square (`0px` radius) - only the top corners round -
confirmed directly from Figma's per-corner radius data. It's useful for a search box or inline-edit
field that shouldn't visually compete with surrounding content until someone interacts with it.
`appearance="default"` (the standard bordered look, rounded on all four corners) is correct for
nearly every other case.

## Leading and trailing slots

- **`iconBefore`** is icon-or-text only, and always decorative (`aria-hidden`) - it never carries
  information the input's own accessible name doesn't already have. A short text prefix (e.g. a
  currency symbol like `$`) renders at a fixed `body-lg` typography regardless of the field's own
  size, confirmed directly from Figma.
- **`iconAfter`** is icon-or-action - it can hold a plain decorative icon, or a real interactive
  control. When it's an action (most commonly a clear button), pass an actual `IconButton` with
  `appearance="subtle"` and `shape="square"` - not a bare icon standing in for one - so it stays a
  real, focusable, labeled button. It can also hold a full `Button` when the trailing action needs
  a text label. Because this slot can be interactive, it is never forced `aria-hidden`.
- **`leadingContent`** is an interactive in-frame slot between `iconBefore` and the input, sharing
  its row. Unlike `iconBefore` it is not `aria-hidden`, and it shrinks and clips to keep the field
  single-line. It exists so a token/multi-select field can render removable chips inside the frame
  without a second bordered frame - [Select](../select/select.md) uses it for its multi-select
  chips. Omit it for an ordinary field.

Related components and patterns include Checkbox, Radio, and Switch (the other native-form-control
atoms in this system), Icon Button (for the trailing clear/action slot), and Select (for choosing
from a fixed set of options instead of typing free text).
