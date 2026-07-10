# Badge

Badge is a compact, non-interactive atom used to display short numeric values such as counts, tallies, and score changes. It helps people scan lightweight numeric information without adding the weight of a status label, tag, or action control.

Use Badge for notification counts, small totals, score deltas, and compact numeric indicators inside navigation, lists, cards, tables, buttons, or summary areas.

Do not use Badge for long text, multi-line content, complex status information, actions, navigation, or anything that requires hover, focus, active, disabled, or loading behavior. Badge should remain a simple visual indicator.

The design intent is to keep the component small, visually contained, and easy to scan. Badge supports a limited tone set for neutral/default values, inverse surfaces, brand emphasis, positive values, and negative values. Content should be short, usually one to four characters, such as `1`, `+1`, or `-1`.

Badge renders as a non-focusable `span`. It may receive an `ariaLabel` when the visible value needs additional context, such as `1 unread notification`. Do not add button semantics, ARIA roles, keyboard handling, or interactive behavior.

Related components and patterns include Tag, Label/Lozenge-style indicators, Tooltip for additional context, and Button/IconButton when the numeric indicator is attached to an action.
