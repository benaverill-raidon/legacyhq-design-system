// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LAYERS } from '../../primitives/layers';
import { ToastGroup } from './toast-group';
import { toast } from './toast-store';

const toastGroupCss = readFileSync('packages/ui/src/components/organisms/toast-group/toast-group.module.css', 'utf8');
const toastGroupSource = readFileSync('packages/ui/src/components/organisms/toast-group/toast-group.tsx', 'utf8');
const tokensCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');

describe('ToastGroup motion', () => {
  it('moves the stack with move-long and fades with fade-long, with no raw timings', () => {
    expect(toastGroupCss).toContain('transition: block-size var(--move-long);');
    expect(toastGroupCss).toMatch(/transform var\(--move-long\),\s*opacity var\(--fade-long\);/);
    expect(toastGroupCss).toContain('transition: opacity var(--fade-long);');
    expect(toastGroupCss).not.toMatch(/\d+ms\s+(ease|linear|cubic-bezier)|cubic-bezier\(/);
  });

  it('skips every transition under reduced motion, including the swipe fade', () => {
    const reduced = toastGroupCss.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(reduced).toMatch(/\.region,\s*\.item,\s*\.item\[data-swiping='true'\] \{\s*transition-duration: 0ms;/);
  });

  it('removes an exiting toast only once the fade-long exit has finished', () => {
    const exitMs = Number(toastGroupSource.match(/const EXIT_MS = (\d+);/)?.[1]);
    const slowMs = Number(tokensCss.match(/--duration-slow: (\d+)ms;/)?.[1]);
    expect(tokensCss).toMatch(/--fade-long: var\(--duration-slow\)/);
    expect(exitMs).toBe(slowMs);
  });
});

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
  vi.useRealTimers();
});

/** Each toast card in the list (the Toast root inside each `li`). */
function cards(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('li > [data-tone]'));
}

function liveRegion() {
  return screen.getByRole('status');
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('ToastGroup', () => {
  it('renders only an empty live region when there are no toasts', () => {
    render(<ToastGroup />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(liveRegion()).toBeEmptyDOMElement();
  });

  it('renders a toast triggered via the imperative API', () => {
    render(<ToastGroup />);

    act(() => {
      toast('Event created', { duration: Infinity });
    });

    expect(screen.getByRole('list', { name: 'Notifications' })).toHaveTextContent('Event created');
  });

  it('stacks above Modal Dialog and below Popup', () => {
    render(<ToastGroup />);

    act(() => {
      toast('Event created', { duration: Infinity });
    });

    expect(screen.getByRole('list', { name: 'Notifications' })).toHaveStyle({ zIndex: String(LAYERS.toast) });
    expect(LAYERS.dialog).toBeLessThan(LAYERS.toast);
    expect(LAYERS.toast).toBeLessThan(LAYERS.popup);
  });

  it('sets the tone from the toast variant helpers', () => {
    const { container } = render(<ToastGroup />);

    act(() => {
      toast.error('Upload failed', { duration: Infinity });
    });

    expect(cards(container)[0]).toHaveAttribute('data-tone', 'error');
  });

  it('updates a toast in place when the same id is reused (loading -> success)', () => {
    const { container } = render(<ToastGroup />);

    act(() => {
      toast.loading('Uploading', { id: 'upload' });
    });
    expect(cards(container)[0]).toHaveAttribute('data-tone', 'loading');

    act(() => {
      toast.success('Uploaded', { id: 'upload' });
    });
    expect(cards(container)).toHaveLength(1);
    expect(cards(container)[0]).toHaveAttribute('data-tone', 'success');
    expect(cards(container)[0]).toHaveTextContent('Uploaded');
  });

  it('keeps a loading toast until it is updated or dismissed', () => {
    vi.useFakeTimers();
    render(<ToastGroup duration={1000} />);

    act(() => {
      toast.loading('Uploading', { id: 'upload' });
    });
    advance(60_000);

    expect(screen.getByText('Uploading', { selector: 'li *' })).toBeInTheDocument();
  });

  it("gives a resolved loading toast the group's duration when the update passes none", () => {
    vi.useFakeTimers();
    render(<ToastGroup duration={2000} />);

    act(() => {
      toast.loading('Uploading', { id: 'upload' });
    });
    advance(10_000);
    act(() => {
      toast.success('Uploaded', { id: 'upload' });
    });
    advance(1999);
    expect(screen.getByText('Uploaded')).toBeInTheDocument();

    advance(1 + 300);
    expect(screen.queryByText('Uploaded')).not.toBeInTheDocument();
  });

  it('gives a resolved loading toast the duration the update passes', () => {
    vi.useFakeTimers();
    render(<ToastGroup duration={2000} />);

    act(() => {
      toast.loading('Uploading', { id: 'upload', duration: 500 });
    });
    act(() => {
      toast.error('Upload failed', { id: 'upload', duration: 8000 });
    });
    advance(7999);
    expect(screen.getByText('Upload failed')).toBeInTheDocument();

    advance(1 + 300);
    expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
  });

  it('dismisses a toast when its dismiss button is clicked', () => {
    vi.useFakeTimers();
    render(<ToastGroup />);

    act(() => {
      toast('Saved', { duration: Infinity });
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('auto-dismisses after the duration elapses', () => {
    vi.useFakeTimers();
    render(<ToastGroup />);

    act(() => {
      toast('Ephemeral', { duration: 4000 });
    });
    expect(screen.getByText('Ephemeral', { selector: 'li *' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
      vi.runAllTimers();
    });

    expect(screen.queryByText('Ephemeral')).not.toBeInTheDocument();
  });

  it('keeps every toast in the DOM while stacked, newest first', () => {
    const { container } = render(<ToastGroup />);

    act(() => {
      toast('First', { duration: Infinity });
      toast('Second', { duration: Infinity });
      toast('Third', { duration: Infinity });
    });

    const titles = cards(container).map((node) => node.textContent);
    expect(titles).toHaveLength(3);
    // Newest is rendered first (front of the stack).
    expect(titles[0]).toContain('Third');
  });

  it('caps the visible stack at maxVisible and keeps the rest out of the accessibility tree and tab order', () => {
    const { container } = render(<ToastGroup maxVisible={2} />);

    act(() => {
      toast('A', { duration: Infinity });
      toast('B', { duration: Infinity });
      toast('C', { duration: Infinity });
    });

    const items = Array.from(container.querySelectorAll('li'));
    expect(items).toHaveLength(3);
    // Only the first `maxVisible` (2) are shown; the oldest is queued: invisible, inert, and hidden.
    const queued = items.filter((item) => item.hasAttribute('inert'));
    expect(queued).toHaveLength(1);
    expect(queued[0]).toHaveTextContent('A');
    expect(queued[0]).toHaveAttribute('aria-hidden', 'true');
    expect(queued[0]).toHaveStyle({ opacity: '0' });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(2);
  });

  it("doesn't start a waiting toast's timer until it's in view", () => {
    vi.useFakeTimers();
    render(<ToastGroup maxVisible={1} />);

    act(() => {
      toast('Older', { duration: 3000 });
      toast('Newer', { duration: 1000 });
    });
    // Older waits behind Newer, so its timer doesn't run.
    advance(1000 + 300);
    expect(screen.queryByText('Newer')).not.toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Older');

    advance(2999);
    expect(screen.getByRole('listitem')).toHaveTextContent('Older');

    advance(1 + 300);
    expect(screen.queryByText('Older')).not.toBeInTheDocument();
  });

  it('keeps a live region on the page and announces each toast through it, once', () => {
    const { container } = render(<ToastGroup />);
    const region = liveRegion();
    expect(region).toHaveAttribute('aria-atomic', 'false');

    act(() => {
      toast.success('Changes saved', { description: 'Your matter is up to date.', duration: Infinity });
    });

    // The same element: added to, not mounted with its text.
    expect(liveRegion()).toBe(region);
    expect(region).toHaveTextContent('Success: Changes saved');
    expect(region).toHaveTextContent('Your matter is up to date.');
    // The cards themselves aren't live regions, so the toast isn't announced twice.
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(cards(container)[0]).toHaveAttribute('role', 'none');
  });

  it('announces an updated toast as a new entry', () => {
    render(<ToastGroup />);
    const region = liveRegion();

    act(() => {
      toast.loading('Uploading', { id: 'upload' });
    });
    const loadingEntry = region.firstElementChild;
    expect(loadingEntry).toHaveTextContent('Uploading');

    act(() => {
      toast.error('Upload failed', { id: 'upload' });
    });
    expect(region.children).toHaveLength(1);
    expect(region.firstElementChild).not.toBe(loadingEntry);
    expect(region).toHaveTextContent('Error: Upload failed');
  });

  it('announces a waiting toast only when it comes into view', () => {
    render(<ToastGroup maxVisible={1} />);
    const region = liveRegion();

    act(() => {
      toast('Older', { id: 'older', duration: Infinity });
      toast('Newer', { id: 'newer', duration: Infinity });
    });
    expect(region).toHaveTextContent('Newer');
    expect(region).not.toHaveTextContent('Older');

    act(() => {
      toast.dismiss('newer');
    });
    expect(region).toHaveTextContent('Older');
  });

  it('expands to reveal descriptions when the stack is hovered', () => {
    render(<ToastGroup />);
    const list = () => screen.getByRole('list', { name: 'Notifications' });

    act(() => {
      toast('Saved', { description: 'Synced across devices', duration: Infinity });
    });

    // Collapsed: description hidden (it's only in the live region).
    expect(list()).not.toHaveTextContent('Synced across devices');

    act(() => {
      fireEvent.pointerEnter(list());
    });

    expect(list()).toHaveTextContent('Synced across devices');
  });

  it('pauses the timers while hovered and resumes them with the time that was left', () => {
    vi.useFakeTimers();
    render(<ToastGroup />);

    act(() => {
      toast('Saved', { duration: 5000 });
    });
    const list = screen.getByRole('list', { name: 'Notifications' });

    advance(3000);
    act(() => {
      fireEvent.pointerEnter(list);
    });
    advance(20_000);
    expect(screen.getByText('Saved', { selector: 'li *' })).toBeInTheDocument();

    act(() => {
      fireEvent.pointerLeave(list);
    });
    advance(1999);
    expect(screen.getByText('Saved', { selector: 'li *' })).toBeInTheDocument();

    advance(1 + 300);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('stays expanded and paused while focus is inside, even after the pointer leaves', () => {
    vi.useFakeTimers();
    render(
      <>
        <button type="button">Outside</button>
        <ToastGroup />
      </>,
    );

    act(() => {
      toast('Saved', { description: 'Synced across devices', duration: 5000 });
    });
    const list = screen.getByRole('list', { name: 'Notifications' });

    act(() => {
      fireEvent.pointerEnter(list);
      screen.getByRole('button', { name: 'Dismiss' }).focus();
      fireEvent.pointerLeave(list);
    });
    expect(list).toHaveAttribute('data-expanded', 'true');
    expect(list).toHaveTextContent('Synced across devices');
    advance(20_000);
    expect(screen.getByText('Saved', { selector: 'li *' })).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: 'Outside' }).focus();
    });
    expect(list).not.toHaveAttribute('data-expanded');

    advance(5000 + 300);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('collapses again when the focused toast is removed', () => {
    vi.useFakeTimers();
    render(<ToastGroup />);

    act(() => {
      toast('First', { id: 'first', duration: Infinity });
    });
    act(() => {
      screen.getByRole('button', { name: 'Dismiss' }).focus();
    });
    expect(screen.getByRole('list')).toHaveAttribute('data-expanded', 'true');

    act(() => {
      toast.dismiss('first');
    });
    act(() => {
      toast('Second', { duration: 1000 });
    });
    expect(screen.getByRole('list')).not.toHaveAttribute('data-expanded');

    advance(1000 + 300);
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
  });
});
