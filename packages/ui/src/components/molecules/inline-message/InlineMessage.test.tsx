// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { InlineMessage } from './inline-message';
import styles from './inline-message.module.css';

const inlineMessageCss = readFileSync('packages/ui/src/components/molecules/inline-message/inline-message.module.css', 'utf8');
const inlineMessageSource = readFileSync('packages/ui/src/components/molecules/inline-message/inline-message.tsx', 'utf8');

afterEach(cleanup);

describe('InlineMessage', () => {
  it('renders the title', () => {
    render(<InlineMessage title="Title" />);

    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders secondaryText when provided', () => {
    render(<InlineMessage title="Title" secondaryText="Secondary text" />);

    expect(screen.getByText('Secondary text')).toBeInTheDocument();
  });

  it('omits secondaryText when not provided', () => {
    const { container } = render(<InlineMessage title="Title" />);

    expect(container.querySelector(`.${styles.secondaryText}`)).not.toBeInTheDocument();
  });

  it('renders a real status icon for a non-default tone', () => {
    const { container } = render(<InlineMessage title="Title" tone="success" />);

    expect(container.querySelector(`.${styles.iconSlot} svg`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.dot}`)).not.toBeInTheDocument();
  });

  it('renders a plain dot for the default tone - no matching status icon exists', () => {
    const { container } = render(<InlineMessage title="Title" />);

    expect(container.querySelector(`.${styles.dot}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.iconSlot} svg`)).not.toBeInTheDocument();
  });

  it('renders a plain, non-interactive row when content is omitted', () => {
    render(<InlineMessage title="Title" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a real button when content is provided', () => {
    render(<InlineMessage title="Title" content="More detail" />);

    expect(screen.getByRole('button', { name: /Title/ })).toBeInTheDocument();
  });

  it('does not render the popup panel until opened', () => {
    render(<InlineMessage title="Title" content="More detail" />);

    expect(screen.queryByText('More detail')).not.toBeInTheDocument();
  });

  it('toggles the popup open and closed on click (uncontrolled)', () => {
    render(<InlineMessage title="Title" content="More detail" />);

    const button = screen.getByRole('button', { name: /Title/ });
    fireEvent.click(button);
    expect(screen.getByText('More detail')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);
    expect(screen.queryByText('More detail')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports defaultOpen for uncontrolled initial state', () => {
    render(<InlineMessage title="Title" content="More detail" defaultOpen />);

    expect(screen.getByText('More detail')).toBeInTheDocument();
  });

  it('supports controlled open/onOpenChange', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <InlineMessage title="Title" content="More detail" open={false} onOpenChange={handleOpenChange} />,
    );

    const button = screen.getByRole('button', { name: /Title/ });
    fireEvent.click(button);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('More detail')).not.toBeInTheDocument();

    rerender(<InlineMessage title="Title" content="More detail" open onOpenChange={handleOpenChange} />);
    expect(screen.getByText('More detail')).toBeInTheDocument();
  });

  it('closes on Escape, inherited from Popup', () => {
    render(<InlineMessage title="Title" content="More detail" defaultOpen />);

    expect(screen.getByText('More detail')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('More detail')).not.toBeInTheDocument();
  });

  it('closes on an outside click, inherited from Popup', () => {
    render(
      <div>
        <InlineMessage title="Title" content="More detail" defaultOpen />
        <button type="button">Outside</button>
      </div>,
    );

    expect(screen.getByText('More detail')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByText('More detail')).not.toBeInTheDocument();
  });

  it('applies className to the root row', () => {
    const { container } = render(<InlineMessage title="Title" className="custom-inline-message" />);

    expect(container.firstElementChild).toHaveClass('custom-inline-message');
  });

  it('maps each tone to its own overlay/hover tint token, matching Figma', () => {
    expect(inlineMessageCss).toContain('background: var(--color-background-neutral-overlay-hover);');
    expect(inlineMessageCss).toContain('background: var(--color-background-information-overlay-hover);');
    expect(inlineMessageCss).toContain('background: var(--color-background-success-overlay-hover);');
    expect(inlineMessageCss).toContain('background: var(--color-background-warning-overlay-hover);');
    expect(inlineMessageCss).toContain('background: var(--color-background-error-overlay-hover);');
  });

  it('delegates positioning, the portal, and dismissal to Popup instead of a local implementation', () => {
    expect(inlineMessageSource).toContain("from '../../primitives/popup'");
    expect(inlineMessageSource).not.toContain('getBoundingClientRect');
    expect(inlineMessageSource).not.toContain('createPortal');
  });

  it("reuses Popup's own aria-expanded wiring instead of a custom open attribute", () => {
    expect(inlineMessageSource).not.toContain('data-open');
    expect(inlineMessageCss).toContain("[aria-expanded='true']");
  });

  it('applies the shared Focus Ring primitive to the trigger button', () => {
    const { container } = render(<InlineMessage title="Title" content="More detail" />);

    const button = container.querySelector('button');
    expect(button).toHaveClass(focusRingClassNames.focusRing, focusRingClassNames.focusRingDefault);
  });

  it('shows the same tint on keyboard focus as on hover, not a separate treatment', () => {
    expect(inlineMessageCss).toMatch(/:is\([^)]*:hover[^)]*:focus-visible[^)]*\)/);
  });

  it('forwards data-force-state to the trigger button for static Storybook regression reference', () => {
    render(<InlineMessage title="Title" content="More detail" data-force-state="focus" />);

    expect(screen.getByRole('button', { name: /Title/ })).toHaveAttribute('data-force-state', 'focus');
  });

  it('resets the row to zero padding - a native button otherwise inherits the UA default', () => {
    expect(inlineMessageCss).toMatch(/\.root \{[\s\S]*?padding: var\(--spacing-none\);/);
  });

  it('applies matching padding on both sides of the text group', () => {
    expect(inlineMessageCss).toMatch(/\.text \{[\s\S]*?padding-inline: var\(--spacing-xs\);/);
  });
});
