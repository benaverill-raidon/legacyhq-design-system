

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    // Standalone MDX documentation pages, attached to a story file via <Meta of={...} />.
    // Listed first so Docs sorts above the stories it documents.
    "../packages/ui/src/components/**/*.mdx",
    "../packages/ui/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  }
};
export default config;
