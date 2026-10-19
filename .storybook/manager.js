import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
// The manager bundler loads .svg as a data URL, so this is the real logo asset, not a copy.
import logoUrl from '../packages/ui/src/assets/logos/logo-full.svg';

// That data URL is minimally encoded (raw quotes and angle brackets), which breaks once it's placed
// inside an HTML attribute below, so re-encode the SVG fully.
const logoSrc = `data:image/svg+xml,${encodeURIComponent(decodeURIComponent(logoUrl.slice(logoUrl.indexOf(',') + 1)))}`;

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
});
