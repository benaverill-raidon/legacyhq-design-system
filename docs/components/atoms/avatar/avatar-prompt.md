# Avatar Component Prompt

Update the existing Avatar atom instead of rebuilding it.

Required changes:

- Remove the deprecated `focus` presence variant.
- Use a dedicated badge container wrapping a badge icon for all sizes.
- Match badge sizing for `xs`, `sm`, `md`, `lg`, and `xl` to the current Figma anatomy.
- Keep XS badge placement offset by `-2px` at the inline and block end.
- Map `offline` to the semantic subtle content token.
- Preserve existing image fallback, selected, disabled, accessibility, and interactive behavior.
- Remove disabled plus badge combinations from stories and examples.
