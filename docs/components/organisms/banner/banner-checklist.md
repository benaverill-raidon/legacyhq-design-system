# Banner - Completion Checklist

## Component name

Banner

## Description

A full-width, page-level announcement bar carrying a single high-visibility message on a bold
background, with an optional leading status icon and optional inverse-tone actions.

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] `appearance` (`default` | `warning` | `error`) sets both the bold background and the leading
      status icon - no separate tone axis.
- [ ] The Figma `appearance` variant `appearance4` maps to the code appearance `default`.
- [ ] Height hugs content (single message row + block padding) rather than a fixed height.
- [ ] The message truncates to a single line with an ellipsis instead of wrapping.
- [ ] `default` uses a plain dot (no dedicated status glyph), matching Figma and Inline Message.
- [ ] The leading icon inherits the banner content color rather than its own status color.
- [ ] Actions are passed in via a slot and expected to be inverse-tone Buttons / a Button Group.
- [ ] `role` defaults to `status` and is overridable.

## Figma properties

```txt
appearance: default (appearance4) | warning | error
showIcon: true | false
```

## Code props

```ts
type BannerAppearance = 'default' | 'warning' | 'error';

interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: BannerAppearance;
  children: React.ReactNode;
  showIcon?: boolean;
  actions?: React.ReactNode;
}
```

## Defaults

```txt
appearance: default
showIcon: true
role: status
```

## Tokens

- [ ] padding-inline `--spacing-2xl`, padding-block `--spacing-sm`.
- [ ] root gap `--spacing-sm`, message gap `--spacing-xs`, actions gap `--spacing-xs`.
- [ ] icon slot `--size-300`, dot `--size-marker-sm`.
- [ ] message typography `body-md`.
- [ ] per-appearance bold background + content tokens (no primitives, no raw values).

## Visual and structural requirements

- [ ] Full-width bar; height hugs content.
- [ ] Single-line, ellipsis-truncated message.
- [ ] Icon slot decorative (`aria-hidden`), color inherited.
- [ ] Actions region rendered only when `actions` is provided.

## Accessibility

- [ ] `role="status"` by default; overridable (e.g. `alert`).
- [ ] Icon slot `aria-hidden`.
- [ ] Meaning conveyed by text, not color alone.

## Examples to document

- [ ] Neutral announcement
- [ ] Warning
- [ ] Error with a single action
- [ ] Two actions in a Button Group
- [ ] Without the leading icon
- [ ] Urgent error (`role="alert"`)

## Tests

- [ ] Renders the message.
- [ ] Defaults to role status and the default appearance.
- [ ] Applies the appearance class.
- [ ] Status icon for warning/error, dot for default.
- [ ] Hides the icon when `showIcon` is false.
- [ ] Renders / omits the actions region.
- [ ] Truncates the message to a single line.
- [ ] Overridable role.
- [ ] Forwards the ref.
- [ ] Uses MUI: no. Uses Tailwind: no.
