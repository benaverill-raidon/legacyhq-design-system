# Label Component Checklist

## Purpose

Label is a compact visual indicator used to help users quickly recognize an item's status, category, or classification.

It should support fast scanning without becoming a primary action, navigation element, or form control.

## Component Type

- Layer: Atom
- Interactivity: Non-interactive
- Rendered element: `span`
- Content model: Text-only

## Primary Use Cases

Use Label for:

- Status indicators
- Classification tags
- Small metadata markers
- Domain-specific categorizations such as law or wealth
- Compact visual annotations in cards, tables, lists, and page headers

Do not use Label for:

- Buttons
- Links
- Dropdown triggers
- Removable tags
- User-entered chips
- Filters or selectable values

Future interactivity, such as dropdown-trigger behavior, should be handled by a separate component or explicit interactive wrapper.

## Content Rules

- Keep text short, ideally 1 to 3 words.
- Avoid full sentences.
- Avoid using labels as the only way to communicate meaning when color is involved.
- Label text is visually uppercase through typography styling.
- Consumers may pass normal-cased text; the component applies the uppercase transform.
- Avoid punctuation unless it is part of a known code or abbreviation.

## Variants

### Size

- `sm`
- `md`

### Tone

- `default`
- `information`
- `warning`
- `discovery`
- `error`
- `success`
- `law`
- `wealth`

### Emphasis

- `subtle`
- `bold`

## Accessibility Requirements

- Label must not be keyboard-focusable by default.
- Label must not use interactive roles.
- Label should not include `aria-label` unless additional context is needed.
- Color alone must not be the only source of meaning in critical workflows.
- Visible text should communicate the meaning clearly.
- Text/background combinations must meet applicable contrast expectations for small uppercase text.
- If used in a table or status-heavy interface, nearby labels, headings, or column names should provide context.

## Dependencies

- React
- TypeScript
- CSS Modules
- Generated CSS variables from design tokens
- Storybook
- Vitest / React Testing Library

## Design Decisions

- The component is named `Label`, not `Lozenge`.
- The component is non-interactive for the first implementation.
- The component is text-only for the first implementation.
- The component has no border.
- Subtle emphasis uses a softer background with readable foreground text.
- Bold emphasis uses a stronger filled background with inverse foreground text.
- Sizing is controlled through spacing and typography tokens.
- Styling must use semantic CSS variables, not primitive color values.
- Product-specific tones such as `law` and `wealth` must map to semantic token roles, not hardcoded colors.

## Open Future Considerations

These are intentionally out of scope for the first implementation:

- Icon support
- Removable labels
- Clickable labels
- Dropdown trigger behavior
- Custom colors
- Truncation behavior beyond normal inline layout constraints
