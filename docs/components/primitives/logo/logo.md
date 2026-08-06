# Logo

Logo is the approved LegacyHQ brand primitive - the single source for rendering the brand mark,
wordmark, or full lockup anywhere in the product, so every surface uses the same approved artwork
instead of a screenshot, a recreated SVG, or a stretched image.

Use Logo in application headers, authentication screens, marketing surfaces, and other branded
experiences. Use `type="mark"` in a compact nav rail or collapsed sidebar where the wordmark isn't
needed for recognition.

Do not alter proportions, colors, spacing, or crop the artwork - Logo renders the approved SVG
as-is, with no prop for recoloring, stretching, rotating, or adding shadows/effects. Do not
recreate the wordmark in text - use the `wordmark` or `full` type instead of typing "LegacyHQ" in a
heading font. Do not combine it with other graphics outside the approved `mark`/`wordmark`/`full`
variants.

`full` (mark + wordmark together) is the default and primary lockup - use it whenever there's room.
Five sizes (`xxs` through `lg`) cover everything from a compact nav-rail mark to a prominent
auth-screen lockup; pick the size token rather than scaling the rendered SVG with CSS `transform`.

Unlike Icon, Logo defaults to `decorative={false}` - a logo is usually the accessible name for a
link back to the product's home, so it renders `role="img"` with an accessible label (`title` or
`ariaLabel`, falling back to `"LegacyHQ"`) unless explicitly marked decorative. Set
`decorative={true}` only when the logo sits next to other text that already provides the same
accessible name, so it isn't announced twice.

Related: Icon (the same decorative/informative accessibility pattern, for non-brand glyphs).
