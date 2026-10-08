// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('ToastGroup', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastGroup />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a toast triggered via the imperative API', () => {
    render(<ToastGroup />);

    act(() => {
      toast('Event created', { duration: Infinity });
    });

    expect(screen.getByText('Event created')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('sets the appearance from the toast variant helpers', () => {
    render(<ToastGroup />);

    act(() => {
      toast.error('Upload failed', { duration: Infinity });
    });

    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'error');
  });

  it('updates a toast in place when the same id is reused (loading -> success)', () => {
    render(<ToastGroup />);

    act(() => {
      toast.loading('Uploading', { id: 'upload' });
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'loading');

    act(() => {
      toast.success('Uploaded', { id: 'upload', duration: Infinity });
    });
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'success');
    expect(screen.getAllByRole('status')).toHaveLength(1);
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
    expect(screen.getByText('Ephemeral')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
      vi.runAllTimers();
    });

    expect(screen.queryByText('Ephemeral')).not.toBeInTheDocument();
  });

  it('keeps every toast in the DOM while stacked, newest first', () => {
    render(<ToastGroup />);

    act(() => {
      toast('First', { duration: Infinity });
      toast('Second', { duration: Infinity });
      toast('Third', { duration: Infinity });
    });

    const titles = screen.getAllByRole('status').map((node) => node.textContent);
    expect(titles).toHaveLength(3);
    // Newest is rendered first (front of the stack).
    expect(titles[0]).toContain('Third');
  });

  it('caps the visible stack at maxVisible and queues the rest', () => {
    const { container } = render(<ToastGroup maxVisible={2} />);

    act(() => {
      toast('A', { duration: Infinity });
      toast('B', { duration: Infinity });
      toast('C', { duration: Infinity });
    });

    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(3);
    // Only the first `maxVisible` (2) are shown; the oldest is queued (hidden).
    const hidden = Array.from(items).filter((item) => (item as HTMLElement).style.opacity === '0');
    expect(hidden).toHaveLength(1);
  });

  it('expands to reveal descriptions when the stack is hovered', () => {
    render(<ToastGroup />);

    act(() => {
      toast('Saved', { description: 'Synced across devices', duration: Infinity });
    });

    // Collapsed: description hidden.
    expect(screen.queryByText('Synced across devices')).not.toBeInTheDocument();

    act(() => {
      fireEvent.pointerEnter(screen.getByRole('list', { name: 'Notifications' }));
    });

    expect(screen.getByText('Synced across devices')).toBeInTheDocument();
  });
});
