// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Chip } from '../chip';
import { Tooltip } from '../../atoms/tooltip';
import { ChipGroup } from './chip-group';

const chipGroupCss = readFileSync('packages/ui/src/components/molecules/chip-group/chip-group.module.css', 'utf8');

afterEach(cleanup);

function scopeChips(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <Chip key={index} mode="search" label={`Scope ${index + 1}`} />
  ));
}

describe('ChipGroup', () => {
  it('renders its children', () => {
    render(<ChipGroup>{scopeChips(3)}</ChipGroup>);

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('defaults to start alignment', () => {
    const { container } = render(<ChipGroup>{scopeChips(2)}</ChipGroup>);

    expect(container.firstElementChild).toHaveAttribute('data-alignment', 'start');
  });

  it('supports end alignment', () => {
    const { container } = render(<ChipGroup alignment="end">{scopeChips(2)}</ChipGroup>);

    expect(container.firstElementChild).toHaveAttribute('data-alignment', 'end');
  });

  it.each([
    ['left', 'start'],
    ['right', 'end'],
  ] as const)('still accepts the deprecated %s alignment, laid out as %s', (deprecated, replacement) => {
    const { container, unmount } = render(<ChipGroup alignment={replacement}>{scopeChips(2)}</ChipGroup>);
    const expectedClassName = (container.firstElementChild as HTMLElement).className;
    unmount();

    const { container: deprecatedContainer } = render(<ChipGroup alignment={deprecated}>{scopeChips(2)}</ChipGroup>);

    expect(deprecatedContainer.firstElementChild).toHaveAttribute('data-alignment', replacement);
    expect((deprecatedContainer.firstElementChild as HTMLElement).className).toBe(expectedClassName);
  });

  it('applies its size to every Chip inside', () => {
    render(<ChipGroup size="sm">{scopeChips(3)}</ChipGroup>);

    for (const chip of screen.getAllByRole('button')) {
      expect(chip.closest('[data-mode]')).toHaveAttribute('data-size', 'sm');
    }
  });

  it("lets an individual Chip's own size win over the group's", () => {
    render(
      <ChipGroup size="sm">
        <Chip mode="search" label="Inherits" />
        <Chip mode="search" label="Overrides" size="md" />
      </ChipGroup>,
    );

    expect(screen.getByRole('button', { name: 'Inherits' }).closest('[data-mode]')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Overrides' }).closest('[data-mode]')).toHaveAttribute('data-size', 'md');
  });

  it('leaves Chips on their own default when the group sets no size', () => {
    render(
      <ChipGroup>
        <Chip mode="search" label="Default" />
        <Chip mode="search" label="Explicit" size="sm" />
      </ChipGroup>,
    );

    expect(screen.getByRole('button', { name: 'Default' }).closest('[data-mode]')).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('button', { name: 'Explicit' }).closest('[data-mode]')).toHaveAttribute('data-size', 'sm');
  });

  it('reaches a Chip through a wrapper, which is why this uses context and not cloneElement', () => {
    /*
     * The whole reason for context. `React.cloneElement` only reaches direct children, so a Chip
     * inside a Tooltip - or a fragment, or a conditional - would silently miss the group's size.
     * That is the same structural fragility that detached Chip's own remove button from its pill.
     */
    render(
      <ChipGroup size="sm">
        <Tooltip content="Wrapped">
          <Chip mode="search" label="Through a tooltip" />
        </Tooltip>
        <>
          <Chip mode="search" label="Through a fragment" />
        </>
      </ChipGroup>,
    );

    expect(screen.getByRole('button', { name: 'Through a tooltip' }).closest('[data-mode]')).toHaveAttribute(
      'data-size',
      'sm',
    );
    expect(screen.getByRole('button', { name: 'Through a fragment' }).closest('[data-mode]')).toHaveAttribute(
      'data-size',
      'sm',
    );
  });

  it('does not manage selection - each scope Chip stays independent', () => {
    function Group() {
      const [on, setOn] = React.useState<string[]>([]);
      const toggle = (id: string) =>
        setOn((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

      return (
        <ChipGroup size="md">
          {['a', 'b'].map((id) => (
            <Chip key={id} mode="search" label={id} isSelected={on.includes(id)} onSelectedChange={() => toggle(id)} />
          ))}
        </ChipGroup>
      );
    }

    render(<Group />);

    expect(screen.getByRole('button', { name: 'a' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'b' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('is announced as a group only when it has an accessible name', () => {
    const { container, rerender } = render(<ChipGroup>{scopeChips(2)}</ChipGroup>);

    // An unnamed role="group" is a boundary a screen-reader user steps through for no benefit.
    expect(container.firstElementChild).not.toHaveAttribute('role');

    rerender(<ChipGroup aria-label="Search scopes">{scopeChips(2)}</ChipGroup>);
    expect(screen.getByRole('group', { name: 'Search scopes' })).toBeInTheDocument();
  });

  it('forwards a ref and passes native div attributes through', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ChipGroup ref={ref} id="scopes" data-testid="chip-group">
        {scopeChips(1)}
      </ChipGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('chip-group')).toHaveAttribute('id', 'scopes');
  });

  it('supports a custom className alongside its own', () => {
    const { container } = render(<ChipGroup className="custom-group">{scopeChips(1)}</ChipGroup>);

    expect(container.firstElementChild).toHaveClass('custom-group');
    expect(container.firstElementChild?.className).toMatch(/_root_/);
  });

  it('wraps with a single 8px gap on both axes, matching Figma', () => {
    // Figma measures itemSpacing 8 and counterAxisSpacing 8, so one `gap` covers both.
    expect(chipGroupCss).toMatch(/\.root\s*\{[^}]*flex-wrap:\s*wrap/);
    expect(chipGroupCss).toMatch(/\.root\s*\{[^}]*gap:\s*var\(--spacing-sm\)/);
    expect(chipGroupCss).toMatch(/\.root\s*\{[^}]*align-items:\s*center/);
  });

  it('maps alignment to justify-content, matching Figma primaryAxisAlignItems MIN/MAX', () => {
    // flex-start and flex-end follow the writing direction, so start and end hold right-to-left.
    expect(chipGroupCss).toMatch(/\.alignment_start\s*\{[^}]*justify-content:\s*flex-start/);
    expect(chipGroupCss).toMatch(/\.alignment_end\s*\{[^}]*justify-content:\s*flex-end/);
  });

  it('adds no padding of its own - the group is pure layout', () => {
    expect(chipGroupCss).not.toMatch(/\.root\s*\{[^}]*padding/);
  });
});

describe('ChipGroup focus when a chip is removed', () => {
  // The MutationObserver that moves focus reports after the DOM change, as a microtask.
  async function flushRemoval() {
    await act(async () => {
      await Promise.resolve();
    });
  }

  function RemovableChips({ initial = ['Trusts', 'Wills', 'Estates'] }: { initial?: string[] }) {
    const [labels, setLabels] = React.useState(initial);
    return (
      <ChipGroup aria-label="Applied filters">
        {labels.map((label) => (
          <Chip
            key={label}
            mode="select"
            label={label}
            onRemove={() => setLabels((current) => current.filter((item) => item !== label))}
          />
        ))}
      </ChipGroup>
    );
  }

  it('moves focus to the next chip when a chip is removed from the keyboard', async () => {
    render(<RemovableChips />);
    const remove = screen.getByRole('button', { name: 'Remove Wills' });
    remove.focus();

    // Enter or Space on a native button fires click.
    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.queryByRole('button', { name: 'Remove Wills' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Estates' })).toHaveFocus();
  });

  it('moves focus to the next chip when a chip is removed by a click that did not focus it', async () => {
    render(<RemovableChips />);
    const remove = screen.getByRole('button', { name: 'Remove Trusts' });

    // Safari doesn't focus a button on click, so only the press is seen.
    fireEvent.pointerDown(remove);
    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.getByRole('button', { name: 'Remove Wills' })).toHaveFocus();
  });

  it('moves focus to the previous chip when the last chip is removed', async () => {
    render(<RemovableChips />);
    const remove = screen.getByRole('button', { name: 'Remove Estates' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.getByRole('button', { name: 'Remove Wills' })).toHaveFocus();
  });

  it('moves focus to the group itself when its only chip is removed', async () => {
    render(<RemovableChips initial={['Trusts']} />);
    const remove = screen.getByRole('button', { name: 'Remove Trusts' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    const group = screen.getByRole('group', { name: 'Applied filters' });
    expect(group).toHaveFocus();
    expect(group).toHaveAttribute('tabindex', '-1');
    // Empty and focused, it takes the size of a chip (CSS below), so its focus ring shows.
    expect(group.matches(':empty:focus')).toBe(true);
  });

  it('gives the empty, focused group the size of a chip, so its focus ring shows', () => {
    // jsdom has no layout, so this reads the rule. md chips are --size-control-sm; sm, -xs.
    expect(chipGroupCss).toMatch(
      /\.root:empty:focus\s*\{[^}]*min-block-size:\s*var\(--size-control-sm\)[^}]*min-inline-size:\s*var\(--size-control-sm\)/,
    );
    expect(chipGroupCss).toMatch(
      /\.root\[data-size='sm'\]:empty:focus\s*\{[^}]*min-block-size:\s*var\(--size-control-xs\)[^}]*min-inline-size:\s*var\(--size-control-xs\)/,
    );
  });

  it('leaves focus alone when it is not in the group as a chip is removed', async () => {
    function ExternallyRemoved() {
      const [labels, setLabels] = React.useState(['Trusts', 'Wills']);
      return (
        <>
          <ChipGroup aria-label="Applied filters">
            {labels.map((label) => (
              <Chip key={label} mode="select" label={label} onRemove={() => undefined} />
            ))}
          </ChipGroup>
          <button type="button" onClick={() => setLabels(['Wills'])}>
            Clear trusts
          </button>
        </>
      );
    }
    render(<ExternallyRemoved />);
    const clear = screen.getByRole('button', { name: 'Clear trusts' });
    clear.focus();

    fireEvent.click(clear);
    await flushRemoval();

    expect(clear).toHaveFocus();
  });

  it('leaves focus where the page put it in onRemove', async () => {
    function PageMovesFocus() {
      const [labels, setLabels] = React.useState(['Trusts', 'Wills']);
      const resultsRef = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <ChipGroup aria-label="Applied filters">
            {labels.map((label) => (
              <Chip
                key={label}
                mode="select"
                label={label}
                onRemove={() => {
                  setLabels((current) => current.filter((item) => item !== label));
                  resultsRef.current?.focus();
                }}
              />
            ))}
          </ChipGroup>
          <button ref={resultsRef} type="button">
            Results
          </button>
        </>
      );
    }
    render(<PageMovesFocus />);
    const remove = screen.getByRole('button', { name: 'Remove Trusts' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.getByRole('button', { name: 'Results' })).toHaveFocus();
  });
});
