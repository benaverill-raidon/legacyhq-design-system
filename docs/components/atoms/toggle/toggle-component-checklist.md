# Toggle Component Checklist

## Purpose

A toggle lets users switch a setting between enabled and disabled states. It is best used for immediate, binary preferences where the result is clear from the label or surrounding context.

## Component Type

Atom component.

## Primary Use Cases

- Enable or disable a setting.
- Turn a feature on or off.
- Represent a binary preference in forms or settings panels.
- Show a persistent state that can be changed directly.

## When Not to Use

- Do not use Toggle for selecting one option from a group. Use RadioGroup.
- Do not use Toggle for multi-selection. Use Checkbox.
- Do not use Toggle for one-time form confirmation. Use Checkbox.
- Do not use Toggle when the action needs confirmation before applying.

## Content Rules

- Label should clearly describe the setting being controlled.
- Use concise, action-neutral labels such as “Email notifications,” not “Turn on email notifications.”
- Avoid labels that require users to infer what on/off means.
- Required indicator appears after the visible label when required.
- If no visible label is provided, an accessible label is required.

## Accessibility Requirements

- Use a native checkbox input with `role="switch"`.
- Preserve native keyboard behavior.
- Preserve form compatibility.
- Do not replace the input with a div or button.
- Do not create custom ARIA behavior beyond switch semantics.
- Support visible label association.
- Support `aria-label` when no visible label is provided.
- Support disabled and required states.
- Use shared Focus Ring utility classes for focus-visible styling.
- Respect `prefers-reduced-motion`.

## Architecture Requirements

- Public component: `Toggle`.
- Native input remains the source of truth.
- Private visual indicator renders track, thumb, and internal marks.
- Indicator is component anatomy and must not be exported publicly.
- Internal check/X marks should not be added to the shared icon library.

## Design Decisions

- Code component name is `Toggle`.
- Optional visible label is supported and uses `body-md` typography.
- Control-only usage is allowed when an accessible label is provided.
- API mirrors Checkbox where possible.
- Checked state uses success bold background tokens.
- Unchecked state uses neutral bold background tokens.
- Hover states use the corresponding hovered semantic tokens.
- Pressed interaction should include a subtle Material-inspired thumb movement or expansion.
- Motion must degrade gracefully when reduced motion is preferred.

## Dependencies

- React
- TypeScript
- CSS Modules
- Design token CSS variables
- Focus Ring primitive/utilities
- Storybook
- Vitest
- React Testing Library

## Open Validation Items

- Confirm exact Figma dimensions from plugin inspection:
  - track width
  - track height
  - thumb size
  - thumb travel distance
  - focus ring radius/offset
- Confirm whether internal check/X marks are drawn with CSS pseudo-elements or private inline SVG.
- Confirm whether component-level geometry tokens need to be added after Figma values are extracted.
