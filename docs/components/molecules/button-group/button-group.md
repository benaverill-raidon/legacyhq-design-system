# Button Group

Button Group gives users access to a set of frequently performed, related actions, laid out with
consistent spacing in a row or a column. It is a layout wrapper, not a control of its own - it does
not manage selection, exclusivity, or focus behavior between its children.

Use Button Group whenever two or more related `Button` (or `IconButton`) elements appear together -
a toolbar of actions, a set of choices at the bottom of a dialog, or a form's primary/secondary
action pair.

Do not use Button Group to build a segmented/exclusive-choice control where only one option can be
active at a time - that is a selection pattern (closer to Toggle Button or Radio), not a group of
independent actions. Do not use it to force visually joined/connected buttons - Figma's source
component keeps each button fully rounded and separated by a consistent gap, not seamlessly
connected.

Button Group is a molecule because it composes Button/IconButton atoms into a named layout unit
with its own variant surface (`orientation`), rather than introducing any new visual treatment of
its own - every pixel of color, radius, and typography still comes from the Button/IconButton atoms
it wraps.

Button Group renders a plain `div` and does not alter the focus order or keyboard behavior of its
children - each button remains independently focusable via Tab, exactly as if it weren't wrapped.
Add an accessible label (`aria-label` or `aria-labelledby`) only when the set of actions needs a
name that isn't already obvious from surrounding context; Button Group only takes on `role="group"`
when a label is present.

Related components and patterns include Button and Icon Button (the atoms Button Group always
wraps), and Toggle Button (for a persistent-selection control instead of a set of independent
actions).
