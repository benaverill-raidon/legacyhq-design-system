# Link Component Checklist

## Purpose
A Link takes users to a new location in the product or to another website.

## Type
Atom

## Use cases
- Navigate to another product page
- Navigate to an external website
- Reference related records, documents, or help content
- Provide inline text navigation

## Do not use for
- Submitting forms
- Opening modals as a primary action
- Triggering local UI-only state changes
- Disabled actions

If it triggers an action instead of navigation, use Button.

## Content rules
- Link text should clearly describe the destination.
- Avoid vague copy like “click here.”
- Keep text concise.
- External links should visually indicate that they open a new destination when `target="_blank"` is used.

## Accessibility requirements
- Render a native `<a>`.
- Require `href`.
- Do not use custom roles.
- Do not implement disabled links.
- Preserve keyboard access.
- Use shared Focus Ring primitive for focus-visible styling.
- For `target="_blank"`, automatically apply `rel="noopener noreferrer"`.
- External-link icon must be decorative with `aria-hidden="true"` and `focusable="false"`.

## Design decisions
- Component name: `Link`
- Appearances: `default`, `subtle`, `inverse`
- Sizes: `sm`, `md`
- `sm` maps to `heading-xxs`
- `md` maps to `heading-xs`
- Default underline: none
- Hover/press underline: yes
- Visited: native CSS `:visited`, no `hasVisited` prop
- External icon appears automatically for `target="_blank"`
- No disabled state
- No router abstraction in v1
- No `iconBefore` in v1

## Dependencies
- Focus Ring primitive
- Icon component or internal external-link icon
- Typography tokens
- Link color tokens
- Content/text color tokens
