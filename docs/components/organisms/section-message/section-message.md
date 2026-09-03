# Section Message

## Purpose

Section Message is an organism: a bordered, rounded status panel placed inside the flow of a page or
a section of one. It carries a status - information, success, warning, or error - with an optional
title, a description, optional inline actions, and an optional dismiss button.

## When to use

Use Section Message for a contained, in-context status message inside a section, form, or panel -
communicating the result or constraint of the surrounding content (a permission restriction, a
validation summary, a success confirmation, a warning about the section).

## When not to use

Do not use Section Message for a full-width, page-level announcement bar; use Banner. Do not use it
for a transient, auto-dismissing notification; use Toast. Do not use it for an inline status next to
a single field or row; use Inline Message. Do not use it for a blocking confirmation; use Modal
Dialog.

## Design intent

Section Message is a presentation/layout organism that composes the Icon primitive, the Link atom
(in actions), and the Icon Button atom (the dismiss button). `appearance` (`information`, `success`,
`warning`, `error`) sets the tinted background, the border color, and the status icon together - the
appearance is the semantic signal.

The title and description use the default content color; only the icon and border take the status
color. Unlike Banner (a single truncated line), the description wraps freely, so Section Message
suits longer, multi-line explanations. Actions are `Link`s; Section Message inserts the `·`
separators between them so callers pass bare Links. Dismiss is opt-in (`isDismissible`) and hides the
message while calling `onDismiss`.

## Accessibility expectations

Section Message renders with `role="status"` (a polite live region) by default, so one that appears
dynamically is announced without interrupting. The role is overridable - use `role="alert"` for an
urgent error. The status icon is decorative (`aria-hidden`) and the meaning is carried by the title
and description text, not by color alone. The dismiss control is a labelled Icon Button ("Dismiss").

## Related components

- Banner
- Toast
- Inline Message
- Modal Dialog
- Link / Icon Button (composed inside)
