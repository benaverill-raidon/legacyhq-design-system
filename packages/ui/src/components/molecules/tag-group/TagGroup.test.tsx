import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagGroup } from './tag-group';
import type { TagGroupItem } from './tag-group.types';

afterEach(cleanup);

function makeTags(count: number): TagGroupItem[] {
  return Array.from({ length: count }, (_, index) => ({ id: `tag-${index + 1}`, label: `Tag ${index + 1}` }));
}

describe('TagGroup', () => {
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

  it('renders the overflow tag trailing (after visible tags) when alignment is left (default)', () => {
    render(<TagGroup tags={makeTags(12)} maxVisible={10} id="group" />);

    const root = document.getElementById('group') as HTMLElement;
    const children = Array.from(root.children);
    expect(children[children.length - 1]).toHaveTextContent('+2 more');
  });

  it('renders the overflow tag leading (before visible tags) when alignment is right', () => {
    render(<TagGroup tags={makeTags(12)} maxVisible={10} alignment="right" id="group" />);

    const root = document.getElementById('group') as HTMLElement;
    const children = Array.from(root.children);
    expect(children[0]).toHaveTextContent('+2 more');
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

  it('does not close the overflow panel on its own when a truncated tag is selected', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 more' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Tag 11' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
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

  it('applies size uniformly to every visible tag and the overflow tag', () => {
    render(<TagGroup tags={makeTags(11)} maxVisible={10} size="md" />);

    expect(screen.getByText('Tag 1').closest('[data-size]')).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('button', { name: '+1 more' })).toHaveAttribute('data-size', 'md');
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
});
