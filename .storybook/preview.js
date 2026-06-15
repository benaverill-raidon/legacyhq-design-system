/** @type { import('@storybook/react').Preview } */
import { createElement } from 'react';
import '../packages/ui/src/tokens/generated/tokens.css';
import '../packages/ui/src/tokens/generated/light.css';
import '../packages/ui/src/tokens/generated/dark.css';

const preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      return createElement(
        'div',
        { 'data-theme': theme, style: { padding: 16 } },
        createElement(Story)
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
