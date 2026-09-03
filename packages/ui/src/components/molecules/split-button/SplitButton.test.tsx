import * as React from 'react';
// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SplitButton } from './split-button';
import type { SplitButtonProps } from './split-button.types';
import buttonStyles from '../../atoms/button/button.module.css';
import iconButtonStyles from '../../atoms/icon-button/icon-button.module.css';

const splitButtonCss = readFileSync('packages/ui/src/components/molecules/split-button/split-button.module.css', 'utf8');

afterEach(cleanup);

function renderSplitButton(props: Partial<SplitButtonProps> = {}) {
  return render(
    <SplitButton
      secondaryActionLabel="More Save options"
      sections={[{ id: 'actions', items: [{ id: 'save-as', label: 'Save as...' }, { id: 'save-copy', label: 'Save a copy' }] }]}
      {...props}
    >
      {props.children ?? 'Save'}
    </SplitButton>,
  );
}

describe('SplitButton', () => {
  it('renders the primary action with its own label', () => {
    renderSplitButton();

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when the primary action is activated', () => {
    const handleClick = vi.fn();
    renderSplitButton({ onClick: handleClick });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders the secondary action with its own accessible name, distinct from the primary label', () => {
    renderSplitButton();

    expect(screen.getByRole('button', { name: 'More Save options' })).toBeInTheDocument();
  });

  it('opens a menu holding the given sections when the secondary action is activated', () => {
    renderSplitButton();

    fireEvent.click(screen.getByRole('button', { name: 'More Save options' }));

    const menu = screen.getByRole('menu', { name: 'More Save options' });
    expect(within(menu).getByRole('menuitem', { name: 'Save as...' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Save a copy' })).toBeInTheDocument();
  });

  it("calls a menu item's own onSelect when chosen", () => {
    const handleSaveAs = vi.fn();
    renderSplitButton({
      sections: [{ id: 'actions', items: [{ id: 'save-as', label: 'Save as...', onSelect: handleSaveAs }] }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'More Save options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Save as...' }));

    expect(handleSaveAs).toHaveBeenCalledTimes(1);
  });

  it('closes the dropdown on Escape, inherited from Popup', () => {
    renderSplitButton();

    fireEvent.click(screen.getByRole('button', { name: 'More Save options' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('disables both the primary and secondary actions when disabled is set', () => {
    renderSplitButton({ disabled: true });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'More Save options' })).toBeDisabled();
  });

  it('disables the secondary action while the primary action is loading', () => {
    renderSplitButton({ isLoading: true });

    expect(screen.getByRole('button', { name: 'More Save options' })).toBeDisabled();
  });

  it("does not call the primary action's onClick while isLoading, inherited from Button", () => {
    const handleClick = vi.fn();
    renderSplitButton({ onClick: handleClick, isLoading: true });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies appearance to both the primary and secondary actions', () => {
    renderSplitButton({ appearance: 'primary' });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(buttonStyles.appearance_primary);
    expect(screen.getByRole('button', { name: 'More Save options' })).toHaveClass(iconButtonStyles.appearance_primary);
  });

  it('applies size to both the primary and secondary actions', () => {
    renderSplitButton({ size: 'sm' });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(buttonStyles.size_sm);
    expect(screen.getByRole('button', { name: 'More Save options' })).toHaveClass(iconButtonStyles.size_sm);
  });

  it('forwards a ref to the primary action', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <SplitButton ref={ref} secondaryActionLabel="More options" sections={[{ id: 's', items: [] }]}>
        Save
      </SplitButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute('type', 'button');
  });

  it('supports a custom id and className on the root', () => {
    renderSplitButton({ id: 'custom-split-button', className: 'custom-class' });

    const root = document.getElementById('custom-split-button') as HTMLElement;
    expect(root).toHaveClass('custom-class');
  });

  it("suppresses each segment's own border on the interior edge, matching Figma's per-side stroke weights", () => {
    const primaryRule = splitButtonCss.match(/\.primaryAction\s*\{([^}]*)\}/);
    const secondaryRule = splitButtonCss.match(/\.secondaryAction\s*\{([^}]*)\}/);

    expect(primaryRule?.[1]).toContain('border-inline-end-width: 0;');
    expect(secondaryRule?.[1]).toContain('border-inline-start-width: 0;');
  });

  it('gives the primary-appearance divider a color that actually contrasts against the bold primary fill', () => {
    const rule = splitButtonCss.match(/\.appearance_primary \.divider:not\(\[data-disabled='true'\]\)\s*\{([^}]*)\}/);

    expect(rule?.[1]).toContain('background-color: var(--color-content-brand-primary-subtle);');
    // --color-border-brand-primary-default resolves to the same prussian-900 primitive as the primary
    // button's own background (--color-background-brand-primary-bold-default) - using it here
    // renders an invisible same-color-on-same-color divider.
    expect(rule?.[1]).not.toContain('--color-border-brand-primary-default)');
  });
});
