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
- [ ] `errors` lists the fields a failed submit needs fixed, each a Link that focuses its control (or
      the first control inside a target that can't take focus). No separate error-summary component.

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
  children?: React.ReactNode;
  errors?: Array<{ label: React.ReactNode; message?: React.ReactNode; targetId: string }>;
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
- [ ] errors list `body-md`, `--spacing-lg` start padding, `--spacing-xs` between lines.
- [ ] per-tone subtle background + border + status-icon color tokens (no primitives, no raw values).

## Visual and structural requirements

- [ ] Bordered, rounded box; content wraps.
- [ ] Status icon in its own status color, `aria-hidden`.
- [ ] Actions rendered as passed (no injected separators); region rendered only when actions provided.
- [ ] Dismiss button only when `isDismissible`.
- [ ] Errors list only when `errors` has entries; description only when `children` is set.

## Accessibility

- [ ] `role="status"` by default; overridable (e.g. `alert`).
- [ ] Status icon `aria-hidden`; dismiss button labelled "Dismiss".
- [ ] The status is announced before the title as visually hidden text (`statusLabel`, defaulting to the tone's name).
- [ ] Meaning conveyed by text, not color alone.
- [ ] `errors` is a `ul`; each link focuses its control without changing the URL.

## Examples to document

- [ ] Information with title + actions
- [ ] Success, description only
- [ ] Warning with actions
- [ ] Error, dismissible
- [ ] Urgent error (`role="alert"`)
- [ ] Error summary (`errors`)

## Tests

- [ ] Renders description; renders/omits title.
- [ ] Defaults to role status + information.
- [ ] Applies the tone class; renders a status icon.
- [ ] Actions rendered as passed (no injected separators); region omitted for none.
- [ ] Not dismissible by default; dismisses + calls `onDismiss`.
- [ ] Overridable role; forwards the ref.
- [ ] `errors`: links after the description; focuses the control; falls back to a group's first control; empty array renders nothing.
- [ ] Uses MUI: no. Uses Tailwind: no.
