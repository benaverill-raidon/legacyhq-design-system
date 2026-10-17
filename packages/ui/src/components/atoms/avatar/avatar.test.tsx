import * as React from 'react';
// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Avatar } from './avatar';

const avatarCss = readFileSync('packages/ui/src/components/atoms/avatar/avatar.module.css', 'utf8');
const avatarTokenSource = readFileSync('packages/ui/src/tokens/src/component/avatar.json', 'utf8');

afterEach(() => {
  cleanup();
});

describe('Avatar', () => {
  it('renders the fallback artwork when no src is provided', () => {
    const { container } = render(<Avatar name="Ben Averill" />);

    expect(container.querySelector('[data-avatar-fallback]')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Ben Averill' })).toBeTruthy();
  });

  it('uses full-size theme artwork without fallback-size tokens', () => {
    expect(avatarCss).toContain("background-image: url('./person-light.svg');");
    expect(avatarCss).toContain("background-image: url('./person-dark.svg');");
    expect(avatarCss).not.toContain('avatar-fallback-size');
    expect(avatarTokenSource).not.toContain('fallback-size');
  });

  it('defaults entityType to person and reflects it on the fallback artwork and root', () => {
    const { container } = render(<Avatar name="Ben Averill" />);

    expect(container.querySelector('[data-avatar-fallback]')).toHaveAttribute('data-entity-type', 'person');
    expect(screen.getByRole('img', { name: 'Ben Averill' })).toHaveAttribute('data-entity-type', 'person');
  });

  it('renders the team fallback artwork when entityType is team', () => {
    const { container } = render(<Avatar name="Averill & Partners" entityType="team" />);

    expect(container.querySelector('[data-avatar-fallback]')).toHaveAttribute('data-entity-type', 'team');
    expect(screen.getByRole('img', { name: 'Averill & Partners' })).toHaveAttribute('data-entity-type', 'team');
  });

  it('uses team-specific fallback artwork for both themes, distinct from the person artwork', () => {
    expect(avatarCss).toContain("[data-entity-type='team']");
    expect(avatarCss).toContain("background-image: url('./team-light.svg');");
    expect(avatarCss).toContain("background-image: url('./team-dark.svg');");
  });

  it('entityType has no effect once src loads successfully', () => {
    const { container } = render(<Avatar name="Ben Averill" src="https://example.com/avatar.png" entityType="team" />);

    expect(container.querySelector('img')).toBeTruthy();
    expect(container.querySelector('[data-avatar-fallback]')).toBeFalsy();
  });

  it('renders an image when src is provided', () => {
    const { container } = render(<Avatar name="Ben Averill" src="https://example.com/avatar.png" />);

    expect(container.querySelector('img')).toBeTruthy();
    expect(container.querySelector('[data-avatar-fallback]')).toBeFalsy();
  });

  it('keeps the image inside the clipped content container', () => {
    const { container } = render(<Avatar name="Ben Averill" src="https://example.com/avatar.png" />);

    const image = container.querySelector('img');
    expect(image?.parentElement?.className).toContain('content');
  });

  it('falls back to the artwork when image loading fails', () => {
    const { container } = render(<Avatar name="Ben Averill" src="https://example.com/avatar.png" />);
    const image = container.querySelector('img');

    expect(image).toBeTruthy();
    fireEvent.error(image as HTMLImageElement);

    expect(container.querySelector('img')).toBeFalsy();
    expect(container.querySelector('[data-avatar-fallback]')).toBeTruthy();
  });

  it('retries loading a new src after a previous src failed', () => {
    const { container, rerender } = render(<Avatar name="Ben Averill" src="https://example.com/broken.png" />);
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(container.querySelector('img')).toBeFalsy();

    rerender(<Avatar name="Ben Averill" src="https://example.com/avatar.png" />);

    expect(container.querySelector('img')).toBeTruthy();
    expect(container.querySelector('[data-avatar-fallback]')).toBeFalsy();
  });

  it('renders a non-interactive avatar as a span', () => {
    const { container } = render(<Avatar name="Ben Averill" />);

    expect(container.querySelector('span')).toBeTruthy();
    expect(container.querySelector('button')).toBeFalsy();
  });

  it('renders an interactive avatar as a button and supports clicks', () => {
    const handleClick = vi.fn();

    render(<Avatar name="Ben Averill" isInteractive onClick={handleClick} />);

    const button = screen.getByRole('button', { name: 'Ben Averill' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports disabled interactive avatars', () => {
    const { container } = render(<Avatar name="Ben Averill" isInteractive disabled onClick={() => undefined} />);

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.getAttribute('data-disabled')).toBe('true');
  });

  it('dims a disabled static avatar', () => {
    const { container } = render(<Avatar name="Ben Averill" disabled />);

    expect(container.firstElementChild?.getAttribute('data-disabled')).toBe('true');
    expect(container.firstElementChild?.hasAttribute('disabled')).toBe(false);
  });

  it('still accepts the deprecated isDisabled', () => {
    const { container } = render(<Avatar name="Ben Averill" isInteractive isDisabled onClick={() => undefined} />);

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.getAttribute('data-disabled')).toBe('true');
  });

  it('lets disabled win over the deprecated isDisabled', () => {
    render(<Avatar name="Ben Averill" isInteractive disabled={false} isDisabled onClick={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Ben Averill' })).not.toBeDisabled();
  });

  it('supports decorative avatars', () => {
    const { container } = render(<Avatar decorative />);

    expect(container.querySelector('[role="img"]')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('includes selected and badge details in the accessible label', () => {
    render(<Avatar name="Ben Averill" isSelected presence="online" />);

    expect(screen.getByRole('img', { name: 'Ben Averill, selected, online' })).toBeTruthy();
  });

  it('sets aria-pressed on an interactive avatar given isSelected, without "selected" in its name', () => {
    const { rerender } = render(
      <Avatar name="Ben Averill" isInteractive isSelected presence="online" onClick={() => undefined} />,
    );

    expect(screen.getByRole('button', { name: 'Ben Averill, online' })).toHaveAttribute('aria-pressed', 'true');

    rerender(<Avatar name="Ben Averill" isInteractive isSelected={false} presence="online" onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Ben Averill, online' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('leaves aria-pressed off an interactive avatar without isSelected', () => {
    render(<Avatar name="Ben Averill" isInteractive onClick={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Ben Averill' })).not.toHaveAttribute('aria-pressed');
  });

  it('keeps the selected state with aria-labelledby, through aria-pressed', () => {
    render(
      <>
        <span id="avatar-name">Ben Averill</span>
        <Avatar aria-labelledby="avatar-name" isInteractive isSelected onClick={() => undefined} />
      </>,
    );

    expect(screen.getByRole('button', { name: 'Ben Averill' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('never puts aria-pressed on a static avatar', () => {
    render(<Avatar name="Ben Averill" isSelected />);

    expect(screen.getByRole('img', { name: 'Ben Averill, selected' })).not.toHaveAttribute('aria-pressed');
  });

  it('takes the words it adds to the name as props, for translation', () => {
    const { rerender } = render(
      <Avatar
        name="Ben Averill"
        isSelected
        presence="busy"
        selectedLabel="seleccionado"
        getPresenceLabel={(presence) => ({ online: 'en línea', offline: 'desconectado', busy: 'ocupado' })[presence]}
      />,
    );

    expect(screen.getByRole('img', { name: 'Ben Averill, seleccionado, ocupado' })).toBeTruthy();

    rerender(
      <Avatar
        name="Ben Averill"
        status="declined"
        presence="busy"
        getStatusLabel={(status) => ({ accepted: 'aceptado', declined: 'rechazado' })[status]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Ben Averill, rechazado' })).toBeTruthy();
  });

  it('uses English words by default for every presence and status', () => {
    const cases = [
      [{ presence: 'online' }, 'online'],
      [{ presence: 'offline' }, 'offline'],
      [{ presence: 'busy' }, 'busy'],
      [{ status: 'accepted' }, 'accepted'],
      [{ status: 'declined' }, 'declined'],
    ] as const;

    for (const [props, word] of cases) {
      render(<Avatar name="Ben Averill" {...props} />);
      expect(screen.getByRole('img', { name: 'Ben Averill, ' + word })).toBeTruthy();
      cleanup();
    }
  });

  it('gives status priority over presence', () => {
    const { container } = render(<Avatar name="Ben Averill" presence="online" status="accepted" />);

    expect(container.firstElementChild?.getAttribute('data-badge')).toBe('accepted');
  });

  it('renders the badge container and icon anatomy', () => {
    const { container } = render(<Avatar name="Ben Averill" size="xl" status="accepted" />);

    expect(container.querySelectorAll('[aria-hidden="true"][data-badge="accepted"]')).toHaveLength(1);
    expect(container.querySelectorAll('[aria-hidden="true"][data-badge="accepted"] svg')).toHaveLength(1);
  });

  it('renders local presence icons for online busy and offline', () => {
    const { rerender, container } = render(<Avatar name="Ben Averill" presence="online" />);

    expect(container.querySelector('[aria-hidden="true"][data-badge="online"] svg')?.getAttribute('class')).toContain('badgeGlyph');
    expect(container.querySelectorAll('[data-badge="online"] svg circle')).toHaveLength(1);
    expect(container.querySelector('[data-badge="online"] svg path')).toBeNull();

    rerender(<Avatar name="Ben Averill" presence="busy" />);
    expect(container.querySelector('[aria-hidden="true"][data-badge="busy"] svg')).toBeTruthy();

    rerender(<Avatar name="Ben Averill" presence="offline" />);
    expect(container.querySelector('[aria-hidden="true"][data-badge="offline"] svg')).toBeTruthy();
  });

  it('renders local status icons for accepted and declined', () => {
    const { rerender, container } = render(<Avatar name="Ben Averill" status="accepted" />);

    expect(container.querySelector('[aria-hidden="true"][data-badge="accepted"] svg')).toBeTruthy();

    rerender(<Avatar name="Ben Averill" status="declined" />);
    expect(container.querySelector('[aria-hidden="true"][data-badge="declined"] svg')).toBeTruthy();
  });

  it('does not render a removed tentative status path', () => {
    const { container } = render(<Avatar name="Ben Averill" />);

    expect(container.firstElementChild?.getAttribute('data-status')).toBe('none');
    expect(container.querySelector('[data-badge="tentative"]')).toBeNull();
  });

  it('uses the badge icon wrapper for the visible inverse border path', () => {
    const { container } = render(<Avatar name="Ben Averill" presence="online" />);

    const badgeWrapper = container.querySelector('[aria-hidden="true"][data-badge="online"] > span');
    expect(badgeWrapper?.className).toContain('badgeIcon');
  });


  it('applies selected state data attributes', () => {
    const { container } = render(<Avatar name="Ben Averill" isSelected />);

    expect(container.firstElementChild?.getAttribute('data-selected')).toBe('true');
  });

  it('renders badge state on the requested size', () => {
    const { container } = render(<Avatar name="Ben Averill" size="xs" presence="online" />);

    expect(container.firstElementChild?.getAttribute('data-size')).toBe('xs');
    expect(container.querySelector('[data-badge="online"]')).toBeTruthy();
  });

  it('uses size classes that drive badge container and icon sizing', () => {
    const { container, rerender } = render(<Avatar name="Ben Averill" size="sm" presence="online" />);

    expect(container.firstElementChild?.className).toContain('size_sm');

    rerender(<Avatar name="Ben Averill" size="xl" presence="online" />);
    expect(container.firstElementChild?.className).toContain('size_xl');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<Avatar ref={ref} name="Ben Averill" />);

    expect(ref.current?.getAttribute('data-size')).toBe('md');
  });

  it('forwards custom className', () => {
    const { container } = render(<Avatar name="Ben Averill" className="custom-avatar" />);

    expect(container.firstElementChild?.className).toContain('custom-avatar');
  });
});
