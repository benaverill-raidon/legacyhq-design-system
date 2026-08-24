# Focus Ring

Focus Ring is the single, shared keyboard-focus treatment for this design system. Every
interactive atom - Button, Icon Button, Link, Checkbox, Radio, Switch, Slider, Tag - shows the same
outline color, width, and offset because they all consume this one primitive instead of each
defining their own `:focus-visible` styling.

Use Focus Ring on any custom-built interactive element, and anywhere you'd otherwise be tempted to
write a one-off `outline` or `box-shadow` rule for `:focus-visible`.

Do not use Focus Ring as a standalone visual element - it has no appearance until the wrapped
element is keyboard-focus. Do not use it as a substitute for native focusability - it only styles
focus, it does not make an element focusable; the element still needs to be a real native control
(`button`, `a[href]`, `input`) or carry a `tabIndex`. Do not expect it to appear on pointer hover or
plain `:focus` from a mouse click - it only reacts to `:focus-visible`, by design.

There are two ways to apply it. Most components wrap a single interactive child, so the `FocusRing`
component is simplest - it clones its child and merges the focus classes onto it. Components that
can't wrap a child this way (a raw `<input>` inside a custom control, for example, where other
classes need to be composed onto the same element at the same time) import the raw
`focusRingClassNames` object and compose the classes directly. Both are two entry points to the
same CSS, not two different implementations - this is exactly how Button, Icon Button, and every
other interactive atom apply it internally.

`borderWidth="default"` is the only width Figma's focus-ring component currently defines - the
1px/`compact` option that used to exist there has been removed. The prop is kept in the API (rather
than deleted outright) in case a future dense-control variant is introduced, but there is nothing to
choose between today.

Related components and patterns: every interactive atom in this system - Button, Icon Button, Link,
Checkbox, Radio, Switch, Slider, Tag.
