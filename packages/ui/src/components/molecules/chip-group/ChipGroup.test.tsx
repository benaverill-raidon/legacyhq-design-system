// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Chip } from '../chip';
import { Tooltip } from '../../atoms/tooltip';
import { ChipGroup } from './chip-group';

const chipGroupCss = readFileSync('packages/ui/src/components/molecules/chip-group/chip-group.module.css', 'utf8');

afterEach(cleanup);

function scopeChips(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <Chip key={index} mode="scope" label={`Scope ${index + 1}`} />
  ));
}

describe('ChipGroup', () => {
  it('renders its children', () => {
    render(<ChipGroup>{scopeChips(3)}</ChipGroup>);

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('defaults to left alignment', () => {
    const { container } = render(<ChipGroup>{scopeChips(2)}</ChipGroup>);

    expect(container.firstElementChild).toHaveAttribute('data-alignment', 'left');
  });

  it('supports right alignment', () => {
    const { container } = render(<ChipGroup alignment="right">{scopeChips(2)}</ChipGroup>);

    expect(container.firstElementChild).toHaveAttribute('data-alignment', 'right');
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
        <Chip mode="scope" label="Inherits" />
        <Chip mode="scope" label="Overrides" size="md" />
      </ChipGroup>,
    );

    expect(screen.getByRole('button', { name: 'Inherits' }).closest('[data-mode]')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Overrides' }).closest('[data-mode]')).toHaveAttribute('data-size', 'md');
  });

  it('leaves Chips on their own default when the group sets no size', () => {
    render(
      <ChipGroup>
        <Chip mode="scope" label="Default" />
        <Chip mode="scope" label="Explicit" size="sm" />
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
          <Chip mode="scope" label="Through a tooltip" />
        </Tooltip>
        <>
          <Chip mode="scope" label="Through a fragment" />
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
            <Chip key={id} mode="scope" label={id} isSelected={on.includes(id)} onSelectedChange={() => toggle(id)} />
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
    expect(chipGroupCss).toMatch(/\.alignment_left\s*\{[^}]*justify-content:\s*flex-start/);
    expect(chipGroupCss).toMatch(/\.alignment_right\s*\{[^}]*justify-content:\s*flex-end/);
  });

  it('adds no padding of its own - the group is pure layout', () => {
    expect(chipGroupCss).not.toMatch(/\.root\s*\{[^}]*padding/);
  });
});
