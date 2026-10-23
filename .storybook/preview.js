/** @type { import('@storybook/react').Preview } */
/* global document, window -- the preview runs in the browser */
import { createElement, useLayoutEffect, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { ToastGroup } from '../packages/ui/src/components/organisms/toast-group';
import '../packages/ui/src/tokens/generated/tokens.css';
import '../packages/ui/src/tokens/generated/light.css';
import '../packages/ui/src/tokens/generated/dark.css';

// --- Theme ------------------------------------------------------------------------------------
// The toolbar's theme is set on the preview document's root, not on a wrapper around the story, so
// what a component portals to the end of <body> (Popup, Tooltip, Modal Dialog, Toast Group) gets the
// same theme as the story. The canvas takes its background and text color from the tokens, and
// color-scheme follows the theme, so it never falls back to the browser's own colors (dark text on
// a dark canvas when the OS is in dark mode). Docs pages are light only: in Docs the root is always
// light, whatever the toolbar says.

const canvasStyle = `
html { color-scheme: light; }
html[data-theme='dark'] { color-scheme: dark; }
body { background-color: var(--color-elevation-surface-default); color: var(--color-content-default); }
`;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

if (typeof document !== 'undefined') {
  let style = document.getElementById('legacyhq-canvas-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'legacyhq-canvas-style';
    document.head.appendChild(style);
  }
  style.textContent = canvasStyle;
  applyTheme('light');
}

/**
 * Sets the root's theme before the story paints, and, in the canvas, the Toast Group's props (see
 * below). In an effect rather than the decorator itself, which runs while React is rendering.
 */
function Themed({ theme, toastGroup, children }) {
  useLayoutEffect(() => {
    applyTheme(theme);
    if (toastGroup) setToastGroupProps(toastGroup);
  });
  return children;
}

/** The docs container, with the root held light while a Docs page is open. */
function LightDocsContainer(props) {
  useLayoutEffect(() => {
    applyTheme('light');
    setToastGroupProps({});
  }, []);
  return createElement(DocsContainer, props);
}

// --- Toast Group ------------------------------------------------------------------------------
// One Toast Group for the whole preview, so a story's toasts show wherever it renders: alone, or on
// a Docs page with every other story. It's rendered once, into its own React root at the end of
// <body>, outside every story's tree: on a Docs page each story is its own React root, so a
// decorator can't mount it once. Stories just call toast(). The Toast Group stories' controls
// (maxVisible, duration, label) are passed to it while one of them is open on its own.

let toastGroupProps = {};
const toastGroupListeners = new Set();

function setToastGroupProps(next) {
  if (next.maxVisible === toastGroupProps.maxVisible && next.duration === toastGroupProps.duration && next.label === toastGroupProps.label) {
    return;
  }
  toastGroupProps = next;
  toastGroupListeners.forEach((listener) => listener());
}

function subscribeToastGroupProps(listener) {
  toastGroupListeners.add(listener);
  return () => toastGroupListeners.delete(listener);
}

function GlobalToastGroup() {
  const props = useSyncExternalStore(subscribeToastGroupProps, () => toastGroupProps);
  return createElement(ToastGroup, props);
}

if (typeof document !== 'undefined') {
  // Kept on window so a reload of this module (HMR) re-renders the same root instead of adding one.
  let mount = window.__legacyhqToastGroup;
  if (!mount) {
    const container = document.createElement('div');
    container.id = 'legacyhq-toast-group';
    document.body.appendChild(container);
    mount = window.__legacyhqToastGroup = createRoot(container);
  }
  mount.render(createElement(GlobalToastGroup));
}

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
      const docs = context.viewMode === 'docs';
      const theme = docs ? 'light' : context.globals.theme || 'light';
      const { maxVisible, duration, label } = context.component === ToastGroup ? context.args : {};
      const toastGroup = docs ? undefined : { maxVisible, duration, label };
      return createElement(Themed, { theme, toastGroup }, createElement('div', { style: { padding: 16 } }, createElement(Story)));
    },
  ],
  parameters: {
    docs: { container: LightDocsContainer },
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
