// Every component's types file, inlined by Vite, so docs pages can list the values a prop takes -
// read from the TypeScript rather than retyped. Storybook only, like component-css.ts: tests pass
// source read from disk to the pure helpers in pattern-page-data.ts instead.
export const componentTypes = import.meta.glob('../../components/**/*.types.ts', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

/** The `.types.ts` source of a component, by folder id (`section-message`); empty if it has none. */
export const typesOf = (id: string) => Object.entries(componentTypes).find(([path]) => path.endsWith(`/${id}/${id}.types.ts`))?.[1] ?? '';
