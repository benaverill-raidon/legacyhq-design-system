# Icon Tile

Icon Tile pairs a single icon with a colored, sized background shape. It gives an icon greater
visual emphasis than a bare icon or an Icon Button affords - use it where an icon needs to read as
a small piece of imagery in its own right, not as a clickable control.

Use Icon Tile for feature call-outs, empty-state illustrations, list/card leading visuals, and
category or type indicators where a colored icon container communicates meaning at a glance.

Do not use Icon Tile for actions - it has no interactive states, no `onClick`, and is not
focusable. If the icon needs to be clickable, use Icon Button. Do not use it as a status/count
indicator with text content - that is Badge or Tag's job, not an icon container's.

Icon Tile is a molecule, not an atom, because it composes two lower-level pieces - a sized,
colored container (an atom-level concern already solved by pieces like Avatar's surface) and an
icon (the Icon primitive / generated icon set) - into a single named unit with its own variant
surface (tone, appearance, shape, size) that neither piece owns alone.

Icon Tile renders a non-interactive `div`. It is decorative (`aria-hidden`) by default, since in
most compositions the icon is reinforcing meaning that's already conveyed by adjacent text (a card
title, a list label). Pass `decorative={false}` with `ariaLabel` only when the tile is the sole
carrier of that meaning.

Related components and patterns include Icon (the primitive an Icon Tile always wraps), Avatar
(a similarly sized, similarly shaped container, but for a person/entity rather than a symbol), and
Icon Button (when the icon needs to be a clickable action instead of a static visual).
