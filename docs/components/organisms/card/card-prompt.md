# Card implementation brief

Implement the `card` component set at node `4968:153931` in Components v1.0.0
(`M0eINB6n1BfrXu7ntYqb1i`). Use Figma Console to verify the variant axes and variable bindings.

The user's intent is a surface with a border radius containing a slot that can hold anything.
Keep the API small: `surface`, `border`, `borderRadius`, and `children`, plus native div attributes/ref.
Follow `card.contract.json` and `card-spec.md` for verified design details.

- Five surfaces: raised/default/sunken/deep/none; three radii: lg/xl/xxl.
- Default raised/lg/border=true; optional 1px default border; no shadow.
- Border=false removes the stroke and its width. Surface=none is transparent. Both retain clipping.
- No built-in padding, typography, dimensions, content sections, or interaction states.
- Clip content to the rounded boundary. Let the caller compose and space arbitrary children.
- Use React, TypeScript, CSS Modules, and existing semantic tokens.
- Supply component files, composition tests, Storybook/MDX, all six documentation files, and
  registry/exemplar/index integration following the repository conventions.
- Verify light/dark variants, responsive sizing, and nested control behavior; run repo validation
  and build Storybook.
