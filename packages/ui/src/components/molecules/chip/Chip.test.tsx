// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Chip } from './chip';
import type { MenuSection } from '../../organisms/menu';

const chipCss = readFileSync('packages/ui/src/components/molecules/chip/chip.module.css', 'utf8');

afterEach(cleanup);

function statusSections(onSelect?: () => void): MenuSection[] {
  return [
    {
      id: 'statuses',
      items: [
        { id: 'not-started', label: 'Not started', onSelect },
        { id: 'in-progress', label: 'In progress' },
      ],
    },
  ];
}

function operatorSections(): MenuSection[] {
  return [{ id: 'operators', items: [{ id: 'on', label: 'on' }, { id: 'before', label: 'before' }] }];
}

describe('Chip', () => {
  describe('mode="scope"', () => {
    it('renders a real toggle button carrying aria-pressed', () => {
      render(<Chip mode="scope" label="Matters" />);

      const chip = screen.getByRole('button', { name: 'Matters' });
      expect(chip).toHaveAttribute('aria-pressed', 'false');
    });

    it('reflects isSelected through aria-pressed', () => {
      render(<Chip mode="scope" label="Matters" isSelected />);

      expect(screen.getByRole('button', { name: 'Matters' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onSelectedChange with the next value', () => {
      const handleChange = vi.fn();
      render(<Chip mode="scope" label="Matters" isSelected onSelectedChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Matters' }));

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('toggles independently per chip rather than behaving as a radio group', () => {
      // Several scopes can be on at once; Chip never coordinates siblings. The consumer holds state.
      function Scopes() {
        const [on, setOn] = React.useState<string[]>(['matters']);
        const toggle = (id: string) =>
          setOn((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

        return (
          <>
            {['matters', 'documents'].map((id) => (
              <Chip key={id} mode="scope" label={id} isSelected={on.includes(id)} onSelectedChange={() => toggle(id)} />
            ))}
          </>
        );
      }

      render(<Scopes />);

      expect(screen.getByRole('button', { name: 'matters' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'documents' })).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(screen.getByRole('button', { name: 'documents' }));

      // Turning one on must not turn the other off.
      expect(screen.getByRole('button', { name: 'matters' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'documents' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders no remove button and no dropdown', () => {
      render(<Chip mode="scope" label="Matters" />);

      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('disables the toggle when disabled', () => {
      render(<Chip mode="scope" label="Matters" disabled />);

      expect(screen.getByRole('button', { name: 'Matters' })).toBeDisabled();
    });
  });

  describe('mode="property"', () => {
    it('renders a non-interactive label plus a remove button', () => {
      render(<Chip mode="property" label="Trusts" onRemove={vi.fn()} />);

      // The label names the property; only the remove button is a control.
      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getByText('Trusts')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Trusts' })).toBeInTheDocument();
    });

    it('calls onRemove when the remove button is activated', () => {
      const handleRemove = vi.fn();
      render(<Chip mode="property" label="Trusts" onRemove={handleRemove} />);

      fireEvent.click(screen.getByRole('button', { name: 'Remove Trusts' }));

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('supports an explicit removeAriaLabel', () => {
      render(<Chip mode="property" label="Trusts" onRemove={vi.fn()} removeAriaLabel="Clear the trusts filter" />);

      expect(screen.getByRole('button', { name: 'Clear the trusts filter' })).toBeInTheDocument();
    });

    it('disables the remove button when the chip is disabled, and suppresses its click', () => {
      const handleRemove = vi.fn();
      render(<Chip mode="property" label="Trusts" onRemove={handleRemove} disabled />);

      const remove = screen.getByRole('button', { name: 'Remove Trusts' });
      expect(remove).toBeDisabled();

      fireEvent.click(remove);
      expect(handleRemove).not.toHaveBeenCalled();
    });
  });

  describe('remove tooltip', () => {
    // Tooltip shows on pointerEnter after its own 300ms delay, so these drive fake timers the same
    // way Tooltip's own tests do.
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function hover(element: HTMLElement) {
      fireEvent.pointerEnter(element);
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }

    it('shows a Remove tooltip on hover', () => {
      render(<Chip mode="property" label="Trusts" onRemove={vi.fn()} />);

      hover(screen.getByRole('button', { name: 'Remove Trusts' }));

      expect(screen.getByRole('tooltip')).toHaveTextContent('Remove');
    });

    it('does not show the tooltip while disabled', () => {
      // "Remove" on a chip that cannot be removed is misleading rather than explanatory.
      render(<Chip mode="property" label="Trusts" onRemove={vi.fn()} disabled />);

      const remove = screen.getByRole('button', { name: 'Remove Trusts' });
      hover(remove);
      // A disabled button gets no pointer events of its own, so also try Tooltip's own wrapper.
      hover(remove.parentElement as HTMLElement);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('keeps aria-label as the accessible name, so the tooltip is never the only one', () => {
      render(<Chip mode="property" label="Trusts" onRemove={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Remove Trusts' })).toHaveAttribute('aria-label', 'Remove Trusts');
    });

    it.each([false, true])(
      'keeps the remove button a direct child of the root when disabled=%s',
      (disabled) => {
        /*
         * Regression guard. Tooltip wraps a *disabled* child in an extra <span> so pointer events
         * still fire. That wrapper broke the segment rules, which are all structural
         * (`:first-child` / `:last-child` / `:not(:last-child)`) - the remove button stopped being a
         * direct child of the root and detached from the pill as its own fully-rounded, fully
         * bordered island. Any future wrapper around a segment reintroduces exactly that bug.
         */
        const { container } = render(
          <Chip mode="property" label="Trusts" onRemove={vi.fn()} disabled={disabled} />,
        );

        const root = container.firstElementChild as HTMLElement;
        const remove = screen.getByRole('button', { name: 'Remove Trusts' });

        expect(remove.parentElement).toBe(root);
        expect(remove).toBe(root.lastElementChild);
      },
    );

    it.each([false, true])(
      'keeps every filter segment a direct child of the root when disabled=%s',
      (disabled) => {
        const { container } = render(
          <Chip
            mode="filter"
            label="Due date"
            operator={{ label: 'on', sections: operatorSections() }}
            value={{ label: 'March 2', sections: statusSections() }}
            onRemove={vi.fn()}
            disabled={disabled}
          />,
        );

        const root = container.firstElementChild as HTMLElement;

        // label + operator + value + remove, all siblings, in that order.
        expect(root.children).toHaveLength(4);
        for (const child of Array.from(root.children)) {
          expect(child.className).toMatch(/_segment_/);
        }
      },
    );
  });

  describe('mode="filter"', () => {
    it('renders the property label, the value segment, and a remove button', () => {
      render(
        <Chip mode="filter" label="Status" value={{ label: '2 statuses', sections: statusSections() }} onRemove={vi.fn()} />,
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2 statuses' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Status' })).toBeInTheDocument();
    });

    it('opens the value menu when the value segment is activated', () => {
      render(
        <Chip mode="filter" label="Status" value={{ label: '2 statuses', sections: statusSections() }} onRemove={vi.fn()} />,
      );

      fireEvent.click(screen.getByRole('button', { name: '2 statuses' }));

      const menu = screen.getByRole('menu');
      expect(within(menu).getByRole('menuitem', { name: 'Not started' })).toBeInTheDocument();
    });

    it("calls a value menu item's own onSelect", () => {
      const handleSelect = vi.fn();
      render(
        <Chip
          mode="filter"
          label="Status"
          value={{ label: '2 statuses', sections: statusSections(handleSelect) }}
          onRemove={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: '2 statuses' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Not started' }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('renders no operator segment unless an operator is given', () => {
      const { rerender } = render(
        <Chip mode="filter" label="Status" value={{ label: '2 statuses', sections: statusSections() }} onRemove={vi.fn()} />,
      );

      // label span + value button + remove button
      expect(screen.getAllByRole('button')).toHaveLength(2);

      rerender(
        <Chip
          mode="filter"
          label="Due date"
          operator={{ label: 'on', sections: operatorSections() }}
          value={{ label: 'March 2', sections: statusSections() }}
          onRemove={vi.fn()}
        />,
      );

      expect(screen.getAllByRole('button')).toHaveLength(3);
      expect(screen.getByRole('button', { name: 'on' })).toBeInTheDocument();
    });

    it('names each menu panel after the property and the segment role, not the current value', () => {
      render(
        <Chip
          mode="filter"
          label="Due date"
          operator={{ label: 'on', sections: operatorSections() }}
          value={{ label: 'March 2', sections: statusSections() }}
          onRemove={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'on' }));
      expect(screen.getByRole('menu', { name: 'Due date operator' })).toBeInTheDocument();
    });

    it('lets menuAriaLabel override the composed panel name', () => {
      render(
        <Chip
          mode="filter"
          label="Status"
          value={{ label: '2 statuses', sections: statusSections(), menuAriaLabel: 'Choose statuses' }}
          onRemove={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: '2 statuses' }));
      expect(screen.getByRole('menu', { name: 'Choose statuses' })).toBeInTheDocument();
    });

    it('gives the operator and value segments independent menus', () => {
      render(
        <Chip
          mode="filter"
          label="Due date"
          operator={{ label: 'on', sections: operatorSections() }}
          value={{ label: 'March 2', sections: statusSections() }}
          onRemove={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'on' }));
      expect(screen.getByRole('menuitem', { name: 'before' })).toBeInTheDocument();
      // Opening the operator menu must not also open the value menu.
      expect(screen.queryByRole('menuitem', { name: 'Not started' })).not.toBeInTheDocument();
    });

    it('disables every segment when disabled', () => {
      render(
        <Chip
          mode="filter"
          label="Due date"
          operator={{ label: 'on', sections: operatorSections() }}
          value={{ label: 'March 2', sections: statusSections() }}
          onRemove={vi.fn()}
          disabled
        />,
      );

      for (const button of screen.getAllByRole('button')) {
        expect(button).toBeDisabled();
      }
    });

    it('renders a value preview before the value text when given', () => {
      render(
        <Chip
          mode="filter"
          label="Assignee"
          value={{ label: '3 people', sections: statusSections() }}
          valuePreview={<span data-testid="preview" />}
          onRemove={vi.fn()}
        />,
      );

      expect(screen.getByTestId('preview')).toBeInTheDocument();
    });
  });

  it('applies size and mode to the root for every mode', () => {
    const { container } = render(<Chip mode="scope" label="Matters" size="sm" />);

    expect(container.firstElementChild).toHaveAttribute('data-size', 'sm');
    expect(container.firstElementChild).toHaveAttribute('data-mode', 'scope');
  });

  it('defaults to size md', () => {
    const { container } = render(<Chip mode="scope" label="Matters" />);

    expect(container.firstElementChild).toHaveAttribute('data-size', 'md');
  });

  it('supports a custom id and className on the root', () => {
    render(<Chip mode="scope" label="Matters" id="scope-chip" className="custom-chip" />);

    expect(document.getElementById('scope-chip')).toHaveClass('custom-chip');
  });

  it('draws exactly one 1px line per junction by dropping each segment\'s trailing border', () => {
    // Figma suppresses only the leading segment's trailing stroke, which doubles to 2px between two
    // middle segments (its `due date` filter has an operator and a value side by side). Normalized.
    expect(chipCss).toMatch(/\.segment:not\(:last-child\)\s*\{[^}]*border-inline-end-width:\s*0/);
  });

  it('rounds only the outer corners, squaring every interior one', () => {
    expect(chipCss).toMatch(/\.segment:first-child\s*\{[^}]*border-start-start-radius:\s*var\(--border-radius-full-round\)/);
    expect(chipCss).toMatch(/\.segment:last-child\s*\{[^}]*border-start-end-radius:\s*var\(--border-radius-full-round\)/);
  });

  it('maps selected to the dedicated selected token family', () => {
    const base = chipCss.match(/\.selected\s*\{([^}]*)\}/);

    expect(base?.[1]).toContain('border-color: var(--color-border-selected);');
    expect(base?.[1]).toContain('background: var(--color-background-selected-default-default);');
    expect(base?.[1]).toContain('color: var(--color-content-selected);');
  });

  it('gives the label segment no hover or press fill in any mode', () => {
    // Figma models a hover/press/focus axis on chip-base; skipping it is a deliberate product
    // decision. Interaction fills belong only to the segments that actually act.
    expect(chipCss).not.toMatch(/\.labelSegment[^{]*:hover/);
    expect(chipCss).not.toMatch(/\.mode_scope[^{]*:hover/);
    expect(chipCss).not.toMatch(/\.selected[^{]*:hover/);
    // ...and the generic all-segments rule must not have come back.
    expect(chipCss).not.toMatch(/^\.segment:not\(:disabled\):is\(:hover/m);
  });

  it('keeps hover and press fills on the segments that do act', () => {
    for (const seg of ['operatorSegment', 'valueSegment', 'removeButton']) {
      expect(chipCss).toMatch(new RegExp(`\\.${seg}:not\\(:disabled\\):is\\(:hover`));
      expect(chipCss).toMatch(new RegExp(`\\.${seg}:not\\(:disabled\\):is\\(:active`));
    }
  });

  it('lifts a focused segment above its neighbours so the focus ring is not clipped', () => {
    // The ring is an outline drawn outside the box, and segments sit flush - without this the next
    // segment paints over its trailing edge.
    expect(chipCss).toMatch(/\.segment\s*\{[^}]*position:\s*relative/);
    expect(chipCss).toMatch(/\.segment:is\(:focus-visible, \[data-force-state='focus'\]\)\s*\{[^}]*z-index:\s*1/);
  });

  it("makes the label icon track the label's own colour, without touching the value preview", () => {
    expect(chipCss).toMatch(/\.elemBefore :global\(\[data-color\]\)\s*\{[^}]*color:\s*inherit/);
    // The preview carries real per-item meaning (status colours, avatar images) - never overridden.
    expect(chipCss).not.toMatch(/\.preview :global\(\[data-color\]\)/);
  });

  it('maps resting/hover/press segment fills to the neutral-subtle family, matching Figma', () => {
    expect(chipCss).toContain('background: var(--color-background-neutral-subtle-default);');
    expect(chipCss).toContain('background: var(--color-background-neutral-subtle-hover);');
    expect(chipCss).toContain('background: var(--color-background-neutral-subtle-press);');
  });

  it('does not let the scope-mode rule outweigh .selected on color', () => {
    // Regression guard: `.mode_scope .segment { color }` is (0,2,0) and outweighed `.selected`'s
    // (0,1,0), so selected scope chips silently kept content/subtle text. That rule must set only
    // cursor - the unselected color comes from .labelSegment, which .selected legitimately overrides.
    const rule = chipCss.match(/\.mode_scope \.segment\s*\{([^}]*)\}/);

    expect(rule?.[1]).toContain('cursor: pointer;');
    expect(rule?.[1]).not.toContain('color:');
  });

  it('lets disabled fully override selected, including the border', () => {
    // Figma models no selected+disabled chip-base variant, so disabled wins outright - the same
    // precedent Toggle Button and Toggle Icon Button already set for that gap.
    const rule = chipCss.match(/\.root\[data-disabled='true'\] \.segment,\s*\n\.segment:disabled\s*\{([^}]*)\}/);

    expect(rule?.[1]).toContain('border-color: var(--color-border-input);');
    expect(rule?.[1]).toContain('background: var(--color-background-disabled);');
    expect(rule?.[1]).toContain('color: var(--color-content-disabled);');
  });
});
