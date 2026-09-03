// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from './tabs';
import { TabPanel } from './tab-panel';
import styles from './tabs.module.css';
import type { TabItem } from './tabs.types';

const tabsCss = readFileSync('packages/ui/src/components/organisms/tabs/tabs.module.css', 'utf8');

const items: TabItem[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
  { value: 'd', label: 'Delta' },
];

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs tabs={items} aria-label="Sections" {...props}>
      <TabPanel value="a">Panel A</TabPanel>
      <TabPanel value="b">Panel B</TabPanel>
      <TabPanel value="c">Panel C</TabPanel>
      <TabPanel value="d">Panel D</TabPanel>
    </Tabs>,
  );
}

afterEach(cleanup);

describe('Tabs', () => {
  it('renders a labelled tablist with a tab per item', () => {
    renderTabs();

    const tablist = screen.getByRole('tablist', { name: 'Sections' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(4);
  });

  it('selects the first enabled tab by default', () => {
    renderTabs();

    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel A')).toBeVisible();
  });

  it('honors defaultValue for uncontrolled usage', () => {
    renderTabs({ defaultValue: 'd' });

    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveAttribute('aria-selected', 'true');
  });

  it('selects a tab on click and shows its panel', () => {
    renderTabs();

    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }));

    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel B')).toBeVisible();
    expect(screen.queryByText('Panel A')).not.toBeInTheDocument();
  });

  it('wires each panel to its tab with ARIA', () => {
    renderTabs();

    const tab = screen.getByRole('tab', { name: 'Alpha' });
    const panel = screen.getByRole('tabpanel');

    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('uses roving tabindex (only the selected tab is tabbable)', () => {
    renderTabs();

    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves selection with the arrow keys, skipping disabled tabs', () => {
    renderTabs();

    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    fireEvent.keyDown(alpha, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');

    // Gamma is disabled, so ArrowRight from Beta lands on Delta.
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Beta' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveAttribute('aria-selected', 'true');

    // Wraps from Delta back to Alpha.
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Delta' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports Home and End', () => {
    renderTabs({ defaultValue: 'b' });

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Beta' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Delta' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not select a disabled tab on click', () => {
    renderTabs();

    const gamma = screen.getByRole('tab', { name: 'Gamma' });
    expect(gamma).toBeDisabled();

    fireEvent.click(gamma);

    expect(gamma).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports controlled selection', () => {
    const onValueChange = vi.fn();
    const { rerender } = renderTabs({ value: 'a', onValueChange });

    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }));

    // Controlled: value does not change until the parent updates it.
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');

    rerender(
      <Tabs tabs={items} aria-label="Sections" value="b" onValueChange={onValueChange}>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
        <TabPanel value="c">Panel C</TabPanel>
        <TabPanel value="d">Panel D</TabPanel>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
  });

  it('applies the type on the root', () => {
    const { container } = renderTabs({ type: 'contained' });

    expect(container.querySelector(`.${styles.root}`)).toHaveAttribute('data-type', 'contained');
  });
});

describe('Tabs CSS contract', () => {
  it('draws the line indicator with the selected content token over the bottom border', () => {
    expect(tabsCss).toContain('var(--color-border-default)');
    expect(tabsCss).toMatch(/\.root\[data-type='line'\] \.tab\[aria-selected='true'\]::after \{[\s\S]*?background: var\(--color-content-selected\);/);
    expect(tabsCss).toContain('block-size: var(--border-width-lg);');
  });

  it('fills the selected contained tab with the selected surface and border', () => {
    expect(tabsCss).toMatch(/\.root\[data-type='contained'\] \.tab\[aria-selected='true'\] \{[\s\S]*?background: var\(--color-background-selected-default-default\);/);
    expect(tabsCss).toContain('var(--color-border-selected)');
    expect(tabsCss).toMatch(/\.root\[data-type='contained'\] \.tab \{[\s\S]*?border-radius: var\(--border-radius-lg\);/);
  });

  it('wraps the contained tab list in a raised, rounded, bordered, padded container', () => {
    const containerRule = tabsCss.match(/\.root\[data-type='contained'\] \.tablist \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(containerRule).toContain('padding: var(--spacing-xs);');
    expect(containerRule).toContain('border-radius: var(--border-radius-xl);');
    expect(containerRule).toContain('background: var(--color-elevation-surface-raised-default);');
    expect(tabsCss).toMatch(/\.root\[data-type='contained'\] \.tablistBordered \{[\s\S]*?border-color: var\(--color-border-default\);/);
  });
});
