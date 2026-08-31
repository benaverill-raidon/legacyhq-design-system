// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Menu } from './menu';
import styles from './menu.module.css';
import type { MenuItem, MenuSection } from './menu.types';

const menuCss = readFileSync('packages/ui/src/components/organisms/menu/menu.module.css', 'utf8');

afterEach(cleanup);

function actionSections(overrides: Partial<MenuItem>[] = []): MenuSection[] {
  const base: MenuItem[] = [
    { id: 'rename', label: 'Rename' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete' },
  ];

  return [
    {
      id: 'actions',
      heading: 'Actions',
      items: base.map((item, index) => ({ ...item, ...overrides[index] })),
    },
  ];
}

describe('Menu', () => {
  it('renders every item as a menuitem inside role="menu"', () => {
    render(<Menu aria-label="Actions" sections={actionSections()} showSearch={false} />);

    const menu = screen.getByRole('menu', { name: 'Actions' });
    expect(within(menu).getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders a section heading', () => {
    render(<Menu aria-label="Actions" sections={actionSections()} showSearch={false} />);

    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows a divider before the first section when the search field is present', () => {
    const { container } = render(<Menu aria-label="Actions" sections={actionSections()} />);

    expect(container.querySelectorAll('[role="separator"]')).toHaveLength(1);
  });

  it('hides the leading divider before the first section when there is no search field - it would otherwise float at the top edge with nothing above it', () => {
    const { container } = render(<Menu aria-label="Actions" sections={actionSections()} showSearch={false} />);

    expect(container.querySelectorAll('[role="separator"]')).toHaveLength(0);
  });

  it('still renders a divider before every section after the first, even with no search field', () => {
    const { container } = render(
      <Menu
        aria-label="Actions"
        showSearch={false}
        sections={[
          { id: 'first', items: [{ id: 'a', label: 'A' }] },
          { id: 'second', items: [{ id: 'b', label: 'B' }] },
        ]}
      />,
    );

    expect(container.querySelectorAll('[role="separator"]')).toHaveLength(1);
  });

  it('renders a description when provided', () => {
    render(
      <Menu
        aria-label="Assign"
        showSearch={false}
        sections={[{ id: 's', items: [{ id: 'a', label: 'Jordan Ellis', description: 'Trusts & estates' }] }]}
      />,
    );

    expect(screen.getByText('Trusts & estates')).toBeInTheDocument();
  });

  it('calls onSelect when a row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <Menu
        aria-label="Actions"
        showSearch={false}
        sections={[{ id: 's', items: [{ id: 'rename', label: 'Rename', onSelect }] }]}
      />,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect for a disabled item', () => {
    const onSelect = vi.fn();
    render(
      <Menu
        aria-label="Actions"
        showSearch={false}
        sections={[{ id: 's', items: [{ id: 'rename', label: 'Rename', disabled: true, onSelect }] }]}
      />,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeDisabled();
  });

  it('uses menuitemcheckbox with aria-checked when selectionType is checkbox', () => {
    render(
      <Menu
        aria-label="View options"
        showSearch={false}
        sections={[{ id: 's', items: [{ id: 'a', label: 'Show drafts', selectionType: 'checkbox', selected: true }] }]}
      />,
    );

    const item = screen.getByRole('menuitemcheckbox', { name: 'Show drafts' });
    expect(item).toHaveAttribute('aria-checked', 'true');
  });

  it('uses menuitemradio with aria-checked when selectionType is radio', () => {
    render(
      <Menu
        aria-label="Sort by"
        showSearch={false}
        sections={[{ id: 's', items: [{ id: 'a', label: 'Most recent', selectionType: 'radio', selected: false }] }]}
      />,
    );

    const item = screen.getByRole('menuitemradio', { name: 'Most recent' });
    expect(item).toHaveAttribute('aria-checked', 'false');
  });

  it('does not set aria-checked when selectionType is absent, even if selected is true', () => {
    render(
      <Menu
        aria-label="Actions"
        showSearch={false}
        sections={[{ id: 's', items: [{ id: 'a', label: 'Rename', selected: true }] }]}
      />,
    );

    expect(screen.getByRole('menuitem', { name: 'Rename' })).not.toHaveAttribute('aria-checked');
  });

  it('filters items by a case-insensitive substring match on label', () => {
    render(<Menu aria-label="Actions" searchValue="ren" sections={actionSections()} />);

    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Duplicate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('shows emptyMessage when search filters out every item', () => {
    render(<Menu aria-label="Actions" searchValue="zzz" emptyMessage="No matches" sections={actionSections()} />);

    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('shows a loading row instead of sections when loading is true', () => {
    render(<Menu aria-label="Actions" loading showSearch={false} sections={actionSections()} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).not.toBeInTheDocument();
  });

  it('only the first enabled item is a tab stop initially; the rest are excluded from tab order', () => {
    render(<Menu aria-label="Actions" showSearch={false} sections={actionSections()} />);

    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowDown/ArrowUp move the roving tab stop and DOM focus between items, wrapping at the ends', () => {
    render(<Menu aria-label="Actions" showSearch={false} sections={actionSections()} />);

    const menu = screen.getByRole('menu');
    const rename = screen.getByRole('menuitem', { name: 'Rename' });
    const duplicate = screen.getByRole('menuitem', { name: 'Duplicate' });
    const del = screen.getByRole('menuitem', { name: 'Delete' });

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(duplicate).toHaveFocus();
    expect(duplicate).toHaveAttribute('tabindex', '0');
    expect(rename).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(rename).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(del).toHaveFocus();
  });

  it('Home/End jump to the first/last enabled item', () => {
    render(<Menu aria-label="Actions" showSearch={false} sections={actionSections()} />);

    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'End' });
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'Home' });
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
  });

  it('skips a disabled item during ArrowDown navigation', () => {
    render(
      <Menu
        aria-label="Actions"
        showSearch={false}
        sections={actionSections([{}, { disabled: true }])}
      />,
    );

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });

    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('shows the search field by default and hides it when showSearch is false', () => {
    const { rerender } = render(<Menu aria-label="Actions" sections={actionSections()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(<Menu aria-label="Actions" sections={actionSections()} showSearch={false} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it("renders the search field with TextField's subtle appearance and size=md, matching Figma's tone=subtle, size=md exactly", () => {
    render(<Menu aria-label="Actions" sections={actionSections()} />);

    const field = screen.getByRole('textbox').closest('[data-appearance]');
    expect(field).toHaveAttribute('data-appearance', 'subtle');
    expect(field).toHaveAttribute('data-size', 'md');
  });

  it('does not render a leading search icon (removed - too small at this size)', () => {
    render(<Menu aria-label="Actions" sections={actionSections()} />);

    const field = screen.getByRole('textbox').closest('[data-appearance]') as HTMLElement;
    expect(field.querySelector('svg')).not.toBeInTheDocument();
  });

  it('autoFocuses the search field on mount, matching every time a containing Dropdown Menu opens', () => {
    render(<Menu aria-label="Actions" sections={actionSections()} />);

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it("neutralizes the search field's hover/focus underline and hover background in CSS, matching Figma's menu-search exactly (no hover variant at all, empty fills/strokes in every state)", () => {
    // The selector needs [data-size='md'] plus two :not() clauses (not just a bare
    // :global([data-appearance='subtle']):hover) to reach specificity (0,6,0) - TextField's own
    // hover rule stacks three :not() clauses of its own, landing at (0,5,0), which a simpler
    // override would lose to regardless of CSS source order.
    expect(menuCss).toMatch(
      /\.search\s+:global\(\[data-appearance='subtle'\]\[data-size='md'\]:not\(\[data-disabled='true'\]\):not\(\[data-invalid='true'\]\)\):hover\s*\{[^}]*background:\s*transparent/,
    );
    expect(menuCss).toMatch(
      /\.search\s+:global\(\[data-appearance='subtle'\]\[data-size='md'\]:not\(\[data-disabled='true'\]\):not\(\[data-invalid='true'\]\)\):focus-within\s*\{[^}]*border-bottom-color:\s*transparent/,
    );
  });

  it('applies the size class controlling the panel width', () => {
    const { container, rerender } = render(<Menu aria-label="Actions" size="sm" sections={actionSections()} showSearch={false} />);
    expect(container.firstChild).toHaveClass(styles.size_sm);

    rerender(<Menu aria-label="Actions" size="lg" sections={actionSections()} showSearch={false} />);
    expect(container.firstChild).toHaveClass(styles.size_lg);
  });

  it('fills its container instead of a fixed size width when fullWidth is set', () => {
    // Used by a trigger-matched panel (Dropdown Menu's matchTriggerWidth) - the size width would
    // otherwise fight the width Popup applies to the panel.
    const { container } = render(
      <Menu aria-label="Actions" size="sm" fullWidth sections={actionSections()} showSearch={false} />,
    );

    expect(container.firstChild).toHaveClass(styles.fullWidth);
    expect(container.firstChild).not.toHaveClass(styles.size_sm);
  });

  it('maps Figma-verified tokens for width, spacing, and selected-row color', () => {
    expect(menuCss).toContain('var(--component-menu-width-sm)');
    expect(menuCss).toContain('var(--component-menu-width-md)');
    expect(menuCss).toContain('var(--component-menu-width-lg)');
    expect(menuCss).toContain('var(--color-background-neutral-overlay-hover)');
    expect(menuCss).toContain('var(--color-background-neutral-overlay-press)');
    expect(menuCss).toContain('var(--color-background-selected-default-default)');
    expect(menuCss).toContain('var(--color-content-selected)');
  });

  it('maps every selected-row token to the dedicated selected family, not the brand-primary family', () => {
    // Re-verified against Figma's own menu-item bindings: the fill steps through
    // color/background/selected/default/{default,hover,press}, the left indicator is
    // color/border/selected, and the text is color/content/selected. This previously borrowed the
    // brand-primary-subtle family, which was the closest match before a selected family existed.
    expect(menuCss).toMatch(/\.item_selected\s*\{[^}]*color:\s*var\(--color-content-selected\)/);
    expect(menuCss).toMatch(/\.item\.item_selected[^{]*:is\(:hover, :focus-visible\)\s*\{[^}]*var\(--color-background-selected-default-hover\)/);
    expect(menuCss).toMatch(/\.item\.item_selected[^{]*:active\s*\{[^}]*var\(--color-background-selected-default-press\)/);
    expect(menuCss).not.toContain('--color-content-brand-primary-default');
    expect(menuCss).not.toContain('--color-background-brand-primary-subtle');
    expect(menuCss).not.toContain('--color-border-brand-primary');
  });

  it("renders the selected indicator as a 2px inset left box-shadow, not a border-left, matching Figma's strokeAlign=INSIDE (padding stays unchanged)", () => {
    // Regression guard: a real `border-left` would add to the row's box size and shift selected
    // rows 2px to the right relative to unselected ones - Figma's own paddingLeft is identical
    // (spacing/md) whether isSelected is true or false, because the stroke paints inside the
    // existing bounds.
    expect(menuCss).toMatch(/\.item_selected\s*\{[^}]*box-shadow:\s*inset var\(--border-width-md\) 0 0 0 var\(--color-border-selected\)/);
    expect(menuCss).not.toMatch(/\.item_selected\s*\{[^}]*border-left/);
  });

  it('sizes the title-row gap to spacing/sm (8px), matching the Figma title-container itemSpacing exactly', () => {
    expect(menuCss).toMatch(/\.titleRow\s*\{[^}]*gap:\s*var\(--spacing-sm\)/);
  });

  it('sizes the section body padding to a symmetric spacing/xs (4px) padding-block, matching Figma exactly', () => {
    // Previously asymmetric (xs top / sm bottom). Figma's own `<section>/list` Container now
    // measures paddingTop: 4, paddingBottom: 4 on every instance, so this is a single padding-block.
    expect(menuCss).toMatch(/\.sectionBody\s*\{[^}]*padding-block:\s*var\(--spacing-xs\)/);
    expect(menuCss).not.toMatch(/\.sectionBody\s*\{[^}]*padding-bottom:\s*var\(--spacing-sm\)/);
  });

  it('insets the menu item focus ring so it is not clipped by the horizontally-clipping scroll container', () => {
    // A menu item is width:100% of the panel, and `.sections` (which declares only overflow-y)
    // computes to overflow-x: auto per CSS, clipping horizontally. An outward ring had no room and
    // got shaved on the left/right edges - offsetting inward by the ring's own width puts its outer
    // edge flush with the row's edge instead.
    expect(menuCss).toMatch(/\.item\s*\{[^}]*--focus-ring-offset:\s*calc\(-1 \* var\(--border-width-md\)\)/);
  });

  it('rings a standalone Avatar in the leading slot with 1px border/inverse, without touching AvatarGroup', () => {
    // Figma's `type=avatar` elemBefore instance carries a color/border/inverse stroke at weight 1,
    // strokeAlign OUTSIDE. The `type=avatar group` variant instead uses elevation/surface/raised,
    // which AvatarGroup already paints itself - the direct-child combinator keeps this rule off it.
    const rule = menuCss.match(/\.elemBefore > :global\(\[data-entity-type\]\)\s*\{([^}]*)\}/);

    expect(rule?.[1]).toContain('box-shadow: 0 0 0 var(--border-width-sm) var(--color-border-inverse);');
  });

  it('gives elemBefore/elemAfter a fixed 24px (--size-300) box regardless of content, matching Figma exactly', () => {
    expect(menuCss).toMatch(/\.elemBefore,\s*\n\.elemAfter\s*\{[^}]*inline-size:\s*var\(--size-300\)/);
    expect(menuCss).toMatch(/\.elemBefore,\s*\n\.elemAfter\s*\{[^}]*block-size:\s*var\(--size-300\)/);
  });

  it('has no background/border of its own - Figma verifies the menu root has empty fills/strokes', () => {
    expect(menuCss).not.toMatch(/^\.menu\s*\{[^}]*background/m);
    expect(menuCss).not.toMatch(/^\.menu\s*\{[^}]*border:/m);
  });
});
