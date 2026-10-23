// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagGroup } from './tag-group';
import type { TagGroupItem } from './tag-group.types';

afterEach(cleanup);

const tagGroupCss = readFileSync('packages/ui/src/components/molecules/tag-group/tag-group.module.css', 'utf8');

function makeTags(count: number): TagGroupItem[] {
  return Array.from({ length: count }, (_, index) => ({ id: `tag-${index + 1}`, label: `Tag ${index + 1}` }));
}

describe('TagGroup', () => {
  it('is a named group with aria-label', () => {
    render(<TagGroup tags={makeTags(2)} aria-label="Matter tags" />);

    expect(screen.getByRole('group', { name: 'Matter tags' })).toBeInTheDocument();
  });

  it('is a named group with aria-labelledby', () => {
    render(
      <>
        <h3 id="tags-heading">Matter tags</h3>
        <TagGroup tags={makeTags(2)} aria-labelledby="tags-heading" />
      </>,
    );

    expect(screen.getByRole('group', { name: 'Matter tags' })).toBeInTheDocument();
  });

  it('has no group role without a name', () => {
    render(<TagGroup tags={makeTags(2)} id="group" />);

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(document.getElementById('group')).not.toHaveAttribute('role');
  });

  it('renders every tag when there is no maxVisible', () => {
    render(<TagGroup tags={makeTags(4)} />);

    for (let index = 1; index <= 4; index += 1) {
      expect(screen.getByText(`Tag ${index}`)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders every tag when tags.length does not exceed maxVisible', () => {
    render(<TagGroup tags={makeTags(3)} maxVisible={5} />);

    expect(screen.queryByRole('button', { name: /more/ })).not.toBeInTheDocument();
  });

  it('truncates beyond maxVisible and renders a "+N more" overflow tag', () => {
    render(<TagGroup tags={makeTags(15)} maxVisible={10} />);

    for (let index = 1; index <= 10; index += 1) {
      expect(screen.getByText(`Tag ${index}`)).toBeInTheDocument();
    }
    for (let index = 11; index <= 15; index += 1) {
      expect(screen.queryByText(`Tag ${index}`)).not.toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: '+5 more' })).toBeInTheDocument();
  });

  it('renders the overflow tag trailing (after visible tags) when alignment is start (default)', () => {
    render(<TagGroup tags={makeTags(12)} maxVisible={10} id="group" />);

    const root = document.getElementById('group') as HTMLElement;
    const children = Array.from(root.children);
    expect(root).toHaveAttribute('data-alignment', 'start');
    expect(children[children.length - 1]).toHaveTextContent('+2 more');
  });

  it('renders the overflow tag leading (before visible tags) when alignment is end', () => {
    render(<TagGroup tags={makeTags(12)} maxVisible={10} alignment="end" id="group" />);

    const root = document.getElementById('group') as HTMLElement;
    const children = Array.from(root.children);
    expect(children[0]).toHaveTextContent('+2 more');
  });

  it.each([
    ['left', 'start'],
    ['right', 'end'],
  ] as const)('still accepts the deprecated %s alignment, placed as %s', (deprecated, replacement) => {
    const { unmount } = render(<TagGroup tags={makeTags(12)} maxVisible={10} alignment={replacement} id="group" />);
    const expected = (document.getElementById('group') as HTMLElement).outerHTML;
    unmount();

    render(<TagGroup tags={makeTags(12)} maxVisible={10} alignment={deprecated} id="group" />);

    expect((document.getElementById('group') as HTMLElement).outerHTML).toBe(expected);
  });

  it('opens a menu holding the remaining truncated tags when the overflow tag is activated', () => {
    render(<TagGroup tags={makeTags(15)} maxVisible={10} />);

    fireEvent.click(screen.getByRole('button', { name: '+5 more' }));

    const menu = screen.getByRole('menu');
    for (let index = 11; index <= 15; index += 1) {
      expect(within(menu).getByRole('menuitem', { name: `Tag ${index}` })).toBeInTheDocument();
    }
  });

  it('calls onOverflowTagSelect with the selected truncated tag', () => {
    const handleSelect = vi.fn();
    const tags = makeTags(11);
    render(<TagGroup tags={tags} maxVisible={10} onOverflowTagSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 more' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Tag 11' }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect.mock.calls[0][0]).toMatchObject({ id: 'tag-11', label: 'Tag 11' });
  });

  it('closes the overflow panel, returning focus to the trigger, when a truncated tag is selected', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 more' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Tag 11' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the overflow panel on an outside click and on Escape, inherited from Popup', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 more' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('uses a custom overflowLabel to render the overflow tag text', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} overflowLabel={(count) => `${count} hidden`} />);

    expect(screen.getByRole('button', { name: '1 hidden' })).toBeInTheDocument();
  });

  it('defaults the overflow menu accessible name to "{count} more tags"', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 more' }));

    expect(screen.getByRole('menu', { name: '1 more tags' })).toBeInTheDocument();
  });

  it('supports a custom overflowMenuAriaLabel', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} overflowMenuAriaLabel="Hidden matters" />);

    fireEvent.click(screen.getByRole('button', { name: '+1 more' }));

    expect(screen.getByRole('menu', { name: 'Hidden matters' })).toBeInTheDocument();
  });

  it.each(['sm', 'md'] as const)(
    'applies size=%s uniformly to every visible tag and the overflow tag',
    (size) => {
      // Figma's size axis is sm (24) / md (32), and within any one variant all eleven tag
      // instances - the ten visible plus the overflow trigger's - carry that variant's own size.
      render(<TagGroup tags={makeTags(11)} maxVisible={10} size={size} />);

      for (const label of ['Tag 1', 'Tag 5', 'Tag 10']) {
        expect(screen.getByText(label).closest('[data-size]')).toHaveAttribute('data-size', size);
      }
      expect(screen.getByRole('button', { name: '+1 more' })).toHaveAttribute('data-size', size);
    },
  );

  it("defaults to sm, not Tag's own md default", () => {
    // Matches the first variant in Figma's grid (size=sm (24)), deliberately diverging from Tag.
    render(<TagGroup tags={makeTags(11)} maxVisible={10} />);

    expect(screen.getByText('Tag 1').closest('[data-size]')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: '+1 more' })).toHaveAttribute('data-size', 'sm');
  });

  it('forwards each tag item\'s own props (tone, href, isRemovable) to the rendered Tag', () => {
    const handleRemove = vi.fn();
    render(
      <TagGroup
        tags={[
          { id: 't1', label: 'Trust', tone: 'green', href: '/trusts/1' },
          { id: 't2', label: 'Removable', isRemovable: true, onRemove: handleRemove },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Trust' })).toHaveAttribute('href', '/trusts/1');
    fireEvent.click(screen.getByRole('button', { name: 'Remove Removable' }));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('supports a custom id and className on the root', () => {
    render(<TagGroup tags={makeTags(2)} id="custom-group" className="custom-class" />);

    const root = document.getElementById('custom-group') as HTMLElement;
    expect(root).toHaveClass('custom-class');
  });

  it('treats a negative maxVisible as 0, showing only the overflow tag', () => {
    render(<TagGroup tags={makeTags(3)} maxVisible={-2} />);
    expect(screen.queryByText('Tag 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Tag 3')).not.toBeInTheDocument();
  });

  it('marks a hidden tag passed disabled as disabled in the overflow menu', () => {
    const tags = makeTags(3);
    tags[2] = { ...tags[2], disabled: true };
    render(<TagGroup tags={tags} maxVisible={2} />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    expect(screen.getByRole('menuitem', { name: 'Tag 3' })).toBeDisabled();
  });
});

describe('TagGroup focus when a tag is removed', () => {
  // The MutationObserver that moves focus reports after the DOM change, as a microtask.
  async function flushRemoval() {
    await act(async () => {
      await Promise.resolve();
    });
  }

  function RemovableTags({ count = 3, maxVisible, ...rest }: { count?: number; maxVisible?: number } & Partial<React.ComponentProps<typeof TagGroup>>) {
    const [tags, setTags] = React.useState(() => makeTags(count));
    return (
      <TagGroup
        id="group"
        {...rest}
        maxVisible={maxVisible}
        tags={tags.map((tag) => ({
          ...tag,
          isRemovable: true,
          onRemove: () => setTags((current) => current.filter((item) => item.id !== tag.id)),
        }))}
      />
    );
  }

  it('moves focus to the next tag when a tag is removed from the keyboard', async () => {
    render(<RemovableTags />);
    const remove = screen.getByRole('button', { name: 'Remove Tag 2' });
    remove.focus();

    // Enter or Space on a native button fires click.
    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.queryByText('Tag 2')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Tag 3' })).toHaveFocus();
  });

  it('moves focus to the next tag when a tag is removed by a click that did not focus it', async () => {
    render(<RemovableTags />);
    const remove = screen.getByRole('button', { name: 'Remove Tag 1' });

    // Safari doesn't focus a button on click, so only the press is seen.
    fireEvent.pointerDown(remove);
    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.getByRole('button', { name: 'Remove Tag 2' })).toHaveFocus();
  });

  it('moves focus to the previous tag when the last tag is removed', async () => {
    render(<RemovableTags />);
    const remove = screen.getByRole('button', { name: 'Remove Tag 3' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.getByRole('button', { name: 'Remove Tag 2' })).toHaveFocus();
  });

  it('moves focus to the tag that takes the place of the last visible one, before the overflow tag', async () => {
    render(<RemovableTags count={4} maxVisible={2} />);
    const remove = screen.getByRole('button', { name: 'Remove Tag 2' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    // Tag 3 moves out of the overflow and into Tag 2's place.
    expect(screen.getByRole('button', { name: 'Remove Tag 3' })).toHaveFocus();
  });

  it('moves focus to the group itself when its only tag is removed', async () => {
    render(<RemovableTags count={1} />);
    const remove = screen.getByRole('button', { name: 'Remove Tag 1' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    const group = document.getElementById('group') as HTMLElement;
    expect(group).toHaveFocus();
    expect(group).toHaveAttribute('tabindex', '-1');
    // Empty and focused, it takes the size of a tag (CSS below), so its focus ring shows.
    expect(group.matches(':empty:focus')).toBe(true);
  });

  it('lands on a group named by aria-label when its only tag is removed', async () => {
    render(<RemovableTags count={1} aria-label="Matter tags" />);
    const remove = screen.getByRole('button', { name: 'Remove Tag 1' });
    remove.focus();

    fireEvent.click(remove);
    await flushRemoval();

    expect(screen.getByRole('group', { name: 'Matter tags' })).toHaveFocus();
  });

  it('gives the empty, focused group the size of a tag, so its focus ring shows', () => {
    // jsdom has no layout, so this reads the rule. sm tags (the default) are --size-control-xs; md, -sm.
    expect(tagGroupCss).toMatch(
      /\.root:empty:focus\s*\{[^}]*min-block-size:\s*var\(--size-control-xs\)[^}]*min-inline-size:\s*var\(--size-control-xs\)/,
    );
    expect(tagGroupCss).toMatch(
      /\.root\[data-size='md'\]:empty:focus\s*\{[^}]*min-block-size:\s*var\(--size-control-sm\)[^}]*min-inline-size:\s*var\(--size-control-sm\)/,
    );
  });
});
