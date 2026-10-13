# Section Message - Completion Checklist

## Component name

Section Message

## Description

A bordered, rounded, in-context status panel carrying an tone-driven status with an optional
title, a description, optional Link Button actions (in a Button Group), and an optional dismiss
button.

## Status

Stable.

## Component tier

Organism.

## Design decisions

- [ ] `tone` (`information` | `success` | `warning` | `error`) sets the tinted background,
      border color, and status icon together - no separate tone axis.
- [ ] The Figma `discovery` tone was removed; code ships four tones.
- [ ] Title and description use the default content color; only the icon and border take the status
      color.
- [ ] The description wraps (no truncation), unlike Banner's single line.
- [ ] Actions are Link Buttons laid out in a Button Group the caller passes; the component injects
      no separators (previously middot-separated Links).
- [ ] Dismiss is opt-in (`isDismissible`), hides the message, and calls `onDismiss`.
- [ ] The icon keeps its own status color rather than inheriting.
- [ ] `role` defaults to `status` and is overridable.

## Figma properties

```txt
tone: information | success | warning | error
title: true | false        (code: title prop, omit to hide)
actions: true | false       (code: actions slot)
isDismissible: true | false (code: isDismissible, default false)
titleText / descriptionText  (code: title / children)
```

## Code props

```ts
type SectionMessageTone = 'information' | 'success' | 'warning' | 'error';

interface SectionMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  tone?: SectionMessageTone;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isDismissible?: boolean;
  onDismiss?: () => void;
}
```

## Defaults

```txt
tone: information
isDismissible: false
role: status
```

## Tokens

- [ ] padding `--spacing-lg`, root gap `--spacing-lg`, content gap `--spacing-sm`, actions gap `--spacing-sm` (owned by the ButtonGroup).
- [ ] border `--border-width-sm`, radius `--border-radius-xl`.
- [ ] title `heading-sm`, description `body-md`.
- [ ] per-tone subtle background + border + status-icon color tokens (no primitives, no raw values).

## Visual and structural requirements

- [ ] Bordered, rounded box; content wraps.
- [ ] Status icon in its own status color, `aria-hidden`.
- [ ] Actions rendered as passed (no injected separators); region rendered only when actions provided.
- [ ] Dismiss button only when `isDismissible`.

## Accessibility

- [ ] `role="status"` by default; overridable (e.g. `alert`).
- [ ] Status icon `aria-hidden`; dismiss button labelled "Dismiss".
- [ ] The status is announced before the title as visually hidden text (`statusLabel`, defaulting to the tone's name).
- [ ] Meaning conveyed by text, not color alone.

## Examples to document

- [ ] Information with title + actions
- [ ] Success, description only
- [ ] Warning with actions
- [ ] Error, dismissible
- [ ] Urgent error (`role="alert"`)

## Tests

- [ ] Renders description; renders/omits title.
- [ ] Defaults to role status + information.
- [ ] Applies the tone class; renders a status icon.
- [ ] Actions rendered as passed (no injected separators); region omitted for none.
- [ ] Not dismissible by default; dismisses + calls `onDismiss`.
- [ ] Overridable role; forwards the ref.
- [ ] Uses MUI: no. Uses Tailwind: no.
