# Icon

Icon communicates meaning through a compact visual symbol and supports other components - it's the
building block behind every icon rendered in this system, from a bare glyph next to a label to the
icon inside a Button, Tag, or Avatar badge.

Use Icon alongside a text label to speed up recognition of a common action or concept, or wherever
a universally recognized glyph improves comprehension without adding text.

Do not rely on an icon alone to convey critical information unless it has an accessible name
(`decorative={false}` + `title`) - color or shape alone is not accessible. Do not use a bare icon as
a standalone interactive control - wrap it in Icon Button if it needs to be clickable.

`IconBase` is the shared primitive every icon renders through - it owns sizing, spacing, and color
logic and wraps a single `<svg>`. Consumers rarely import `IconBase` directly; instead, each glyph
is generated as its own named component (`AddIcon`, `CheckIcon`, `ChevronLeftIcon`, ...) that wraps
`IconBase` with its own `viewBox` and path data, importable from the shared icon set
(`packages/ui/src/assets/icons`). Generated components share `IconBase`'s full prop set - there is
nothing extra to learn per icon. New glyphs are added via `npm run generate:icons`, not written by
hand.

`size` is `sm` or `md` only - there is no per-icon size override; components that need a specific
icon size (Button, Avatar's badge glyph) fix it internally rather than exposing an `iconSize` prop.
`spacing` controls the icon's own hit-box padding independent of its visual size - `spacious`
reserves a larger square around a visually small icon, useful when the icon sits alone as a
touch/click target.

Icons inherit `currentColor` by default (`color="default"`). Reach for the semantic color values
only when the icon itself is carrying that meaning independently of its surrounding text, not just
to make it colorful. Icons default to `decorative={true}` because most sit next to a text label
that already carries the meaning; set `decorative={false}` and provide `title` only when the icon
is the sole carrier of meaning.

Related components: Button, Icon Button, Tag, Tooltip, Avatar, Checkbox, Radio - each composes
generated icons for its own glyphs.
