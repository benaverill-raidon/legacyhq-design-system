import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AvatarGroup } from './avatar-group';
import type { AvatarGroupItem } from './avatar-group.types';
import buttonStyles from '../../atoms/button/button.module.css';

afterEach(cleanup);

function makeAvatars(count: number): AvatarGroupItem[] {
  return Array.from({ length: count }, (_, index) => ({ id: `person-${index + 1}`, name: `Person ${index + 1}` }));
}

describe('AvatarGroup', () => {
  it('renders every avatar when there is no maxVisible', () => {
    render(<AvatarGroup avatars={makeAvatars(4)} />);

    for (let index = 1; index <= 4; index += 1) {
      expect(screen.getByRole('img', { name: `Person ${index}` })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders every avatar when avatars.length does not exceed maxVisible', () => {
    render(<AvatarGroup avatars={makeAvatars(3)} maxVisible={5} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('truncates beyond maxVisible and renders a "+N" overflow trigger', () => {
    render(<AvatarGroup avatars={makeAvatars(6)} maxVisible={4} />);

    for (let index = 1; index <= 4; index += 1) {
      expect(screen.getByRole('img', { name: `Person ${index}` })).toBeInTheDocument();
    }
    for (let index = 5; index <= 6; index += 1) {
      expect(screen.queryByRole('img', { name: `Person ${index}` })).not.toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: '+2' })).toBeInTheDocument();
  });

  it('keeps at least one avatar visible even when maxVisible is 0', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={0} />);

    expect(screen.getByRole('img', { name: 'Person 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+4' })).toBeInTheDocument();
  });

  it('keeps at least one avatar visible even when maxVisible is negative', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={-3} />);

    expect(screen.getByRole('img', { name: 'Person 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+4' })).toBeInTheDocument();
  });

  it('warns in development when maxVisible is clamped to 1', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={0} />);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('maxVisible must be at least 1'));
    warnSpy.mockRestore();
  });

  it('renders the overflow trigger after the visible avatars', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} id="group" />);

    const root = document.getElementById('group') as HTMLElement;
    const children = Array.from(root.children);
    expect(children[children.length - 1]).toHaveTextContent('+1');
  });

  it('opens a menu holding the remaining truncated avatars when the overflow trigger is activated', () => {
    render(<AvatarGroup avatars={makeAvatars(6)} maxVisible={4} />);

    fireEvent.click(screen.getByRole('button', { name: '+2' }));

    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Person 5' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Person 6' })).toBeInTheDocument();
  });

  it('calls onOverflowAvatarSelect with the selected truncated avatar', () => {
    const handleSelect = vi.fn();
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} onOverflowAvatarSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('button', { name: '+1' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Person 5' }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect.mock.calls[0][0]).toMatchObject({ id: 'person-5', name: 'Person 5' });
  });

  it('does not close the overflow panel on its own when a truncated avatar is selected', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} />);

    fireEvent.click(screen.getByRole('button', { name: '+1' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Person 5' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes the overflow panel on an outside click and on Escape, inherited from Popup', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} />);

    fireEvent.click(screen.getByRole('button', { name: '+1' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('uses a custom overflowLabel to render the overflow trigger text', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} overflowLabel={(count) => `${count} more`} />);

    expect(screen.getByRole('button', { name: '1 more' })).toBeInTheDocument();
  });

  it('defaults the overflow menu accessible name to "{count} more people"', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} />);

    fireEvent.click(screen.getByRole('button', { name: '+1' }));

    expect(screen.getByRole('menu', { name: '1 more people' })).toBeInTheDocument();
  });

  it('supports a custom overflowMenuAriaLabel', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} overflowMenuAriaLabel="Hidden people" />);

    fireEvent.click(screen.getByRole('button', { name: '+1' }));

    expect(screen.getByRole('menu', { name: 'Hidden people' })).toBeInTheDocument();
  });

  it('applies size uniformly to every visible avatar and the overflow trigger', () => {
    render(<AvatarGroup avatars={makeAvatars(5)} maxVisible={4} size="sm" />);

    expect(screen.getByRole('img', { name: 'Person 1' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: '+1' })).toHaveClass(buttonStyles.size_sm);
  });

  it("forwards each avatar item's own props (src, isInteractive, onClick, isDisabled) to the rendered Avatar", () => {
    const handleClick = vi.fn();
    render(
      <AvatarGroup
        avatars={[
          { id: 'p1', name: 'Clickable Person', isInteractive: true, onClick: handleClick },
          { id: 'p2', name: 'Disabled Person', isInteractive: true, isDisabled: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clickable Person' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Disabled Person' })).toBeDisabled();
  });

  it('falls back through name -> alt -> "Unnamed" for the overflow menu item label', () => {
    render(
      <AvatarGroup
        avatars={[
          { id: 'p1', name: 'Named' },
          { id: 'p2', alt: 'Alt text only' },
          { id: 'p3' },
        ]}
        maxVisible={1}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '+2' }));

    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Alt text only' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Unnamed' })).toBeInTheDocument();
  });

  it("forwards a truncated avatar's own entityType to its overflow menu row's leading avatar", () => {
    render(
      <AvatarGroup
        avatars={[
          { id: 'p1', name: 'Client One' },
          { id: 'p2', name: 'Client Two' },
          { id: 'firm', name: 'Averill & Partners', entityType: 'team' },
        ]}
        maxVisible={2}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '+1' }));

    const row = screen.getByRole('menuitem', { name: 'Averill & Partners' });
    expect(row.querySelector('[data-avatar-fallback]')).toHaveAttribute('data-entity-type', 'team');
  });

  it('supports a custom id and className on the root', () => {
    render(<AvatarGroup avatars={makeAvatars(2)} id="custom-group" className="custom-class" />);

    const root = document.getElementById('custom-group') as HTMLElement;
    expect(root).toHaveClass('custom-class');
  });
});
