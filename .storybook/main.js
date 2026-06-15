

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../packages/ui/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)"
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
