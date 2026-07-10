import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Avatar } from './avatar';

afterEach(() => {
  cleanup();
});

describe('Avatar', () => {
  it('renders the fallback artwork when no src is provided', () => {
    const { container } = render(<Avatar name="Ben Averill" />);

    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Ben Averill' })).toBeTruthy();
  });

  it('renders an image when src is provided', () => {
    const { container } = render(<Avatar name="Ben Averill" src="https://example.com/avatar.png" />);

    expect(container.querySelector('img')).toBeTruthy();
    expect(container.querySelector('svg')).toBeFalsy();
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
    expect(container.querySelector('svg')).toBeTruthy();
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
    const { container } = render(<Avatar name="Ben Averill" isInteractive isDisabled onClick={() => undefined} />);

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
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

  it('applies the xxl size class for the adjusted badge positioning variables', () => {
    const { container } = render(<Avatar name="Ben Averill" size="xxl" status="accepted" />);

    expect(container.firstElementChild?.className).toContain('size_xxl');
    expect(container.querySelector('[aria-hidden="true"][data-badge="accepted"]')).toBeTruthy();
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
