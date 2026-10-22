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
    options: {
      // Sidebar IA. Sections and component groups follow this order; anything not listed (and
      // every component within a group) sorts alphabetically. Story order within a component is
      // untouched (names aren't sorted). The component groups must be the labels in
      // classification.storybook.componentGroups (docs/foundations/component-registry-governance.json),
      // in that order - component-taxonomy.test.ts fails if they drift.
      // Must stay an inline literal: Storybook reads it statically, not by executing this file.
      storySort: {
        method: 'alphabetical',
        order: [
          'Introduction',
          ['Overview', 'Status', 'Getting Started', 'Principles', 'Accessibility', 'Changelog'],
          'Foundations',
          ['Color', 'Typography', 'Spacing', 'Radius', 'Elevation', 'Motion', 'Icons', 'Focus Ring', 'Logo'],
          'Design Tokens',
          ['Overview', 'Tier 1: Primitives', ['Color', 'Dimensions', 'Radius', 'Border', 'Typography', 'Shadow', 'Motion'],
            'Tier 2: Semantic', ['Color', 'Spacing', 'Dimensions', 'Radius', 'Border', 'Typography', 'Elevation', 'Motion'],
            'Tier 3: Component', ['Overview', '*']],
          'Components',
          ['Actions', 'Forms', 'Feedback', 'Navigation', 'Data Display', 'Overlays'],
          'Patterns',
          'Templates',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
