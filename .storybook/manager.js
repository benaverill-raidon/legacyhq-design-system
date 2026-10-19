import React from 'react';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
// The manager bundler loads .svg as a data URL, so this is the real logo asset, not a copy.
import logoUrl from '../packages/ui/src/assets/logos/logo-full.svg';
import governance from '../docs/foundations/component-registry-governance.json';
import registry from '../docs/components/registry.json';

// That data URL is minimally encoded (raw quotes and angle brackets), which breaks once it's placed
// inside an HTML attribute below, so re-encode the SVG fully.
const logoSrc = `data:image/svg+xml,${encodeURIComponent(decodeURIComponent(logoUrl.slice(logoUrl.indexOf(',') + 1)))}`;

// Each component's status (component-registry-governance.json, componentStatus), keyed by the
// sidebar id of its Docs title, so anything not Stable shows its status beside its name.
const displayName = (name) => governance.classification.storybook.displayNameOverrides[name] ?? name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
const groupLabel = (category) => governance.classification.storybook.componentGroups.find((group) => group.category === category)?.label;
const titleOf = (entry) =>
  entry.category === 'foundations' ? `Foundations/${displayName(entry.name)}` : `Components/${groupLabel(entry.category)}/${displayName(entry.name)}`;
const sidebarId = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const statusById = new Map(registry.map((entry) => [sidebarId(titleOf(entry)), entry.status]));
const statusLabel = (status) => governance.componentStatus.values.find(({ value }) => value === status)?.label ?? status;

// Sidebar header branding: the LegacyHQ lockup plus "Design System". `brandImage: null` makes
// Storybook render `brandTitle` as HTML. The logo's fills fall back to dark ink (#282727 text,
// #003655 mark) outside the token CSS, so the manager uses the light base to keep it legible -
// matching the light-only docs pages.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: `<span style="display:inline-flex;align-items:center;gap:8px"><img src="${logoSrc}" alt="LegacyHQ" style="display:block;height:20px;width:auto"><span>Design System</span></span>`,
    brandUrl: './',
    brandImage: null,
  }),
  sidebar: {
    renderLabel: (item) => {
      // Every component has a stories file, so it's a `component` item in the sidebar.
      const status = item.type === 'component' ? statusById.get(item.id) : undefined;
      if (!status || status === 'stable') return item.name;
      // The manager sits outside the token CSS, so the marker is styled inline, quietly.
      return React.createElement(
        'span',
        null,
        item.name,
        React.createElement('span', { style: { marginInlineStart: 6, fontSize: 11, opacity: 0.65 } }, statusLabel(status)),
      );
    },
  },
});
