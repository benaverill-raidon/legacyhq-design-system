# Banner

## Purpose

Banner is an organism: a full-width, page-level announcement bar. It carries a single
high-visibility message on a bold-colored background, with an optional leading status icon and
optional inline actions.

## When to use

Use Banner for a persistent, page-level announcement that applies to the whole page or a major
region - scheduled maintenance, system or service status, a new application version, or a warning
about degraded service.

## When not to use

Do not use Banner for an inline, in-context status next to a field or row; use Inline Message. Do
not use it for a transient, auto-dismissing notification; use Toast. Do not use it for a contained,
boxed message inside a section; use Section Message. Do not use it for a blocking confirmation or
decision; use Modal Dialog.

## Design intent

Banner is a presentation/layout organism. `appearance` (`default`, `warning`, `error`) sets both the
bold background and the leading status icon - the appearance is the semantic signal, so there is no
separate tone axis. The bar hugs its content vertically (a single message row plus block padding)
rather than using a fixed height.

The message truncates to a single line with an ellipsis so the bar stays one row tall; keep the
message short and lead with the essential information. Actions match the bar: the `default` and
`error` bars are dark, so their actions use the on-dark treatment (`isInverse` Buttons, or a Button
Group of them); the amber `warning` bar carries dark content, so its actions use `tone="warning"`
(with `appearance="primary"`) instead.

The leading icon inherits the banner's own content color rather than its own status color, so it
reads correctly on the bold background - `warning`/`error` use their status glyphs and `default`
uses a plain dot (matching Figma and Inline Message's own default fallback).

## Accessibility expectations

Banner renders with `role="status"` by default - a polite live region, so a banner that appears
dynamically is announced without interrupting. The role is overridable: use `role="alert"` for an
urgent error that must interrupt, or remove it for a purely decorative bar. The leading icon is
decorative (`aria-hidden`), and the appearance is conveyed by the message text, not by color alone.

## Related components

- Inline Message
- Toast
- Section Message
- Modal Dialog
- Button / Button Group (the inverse-tone actions Banner composes)
