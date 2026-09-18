// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextArea } from './text-area';
import styles from './text-area.module.css';

const textAreaCss = readFileSync('packages/ui/src/components/molecules/text-area/text-area.module.css', 'utf8');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TextArea', () => {
  // jsdom has no text layout. Supply the browser's measured scroll height in these behavior tests.
  function mockContentHeight() {
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
      return Math.max(1, this.value.split('\n').length) * 24;
    });
  }

  it('keeps native rows and height when autoResize is not enabled', () => {
    render(<TextArea rows={3} defaultValue={'line\n'.repeat(10)} aria-label="Notes" />);
    const field = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(field.rows).toBe(3);
    expect(field.style.height).toBe('');
    expect(field.parentElement).not.toHaveClass(styles.auto_resize);
  });

  it('sizes existing content on mount, grows on input, caps at six lines, and shrinks after deletion', () => {
    mockContentHeight();
    const onInput = vi.fn();
    render(<TextArea autoResize defaultValue={'one\ntwo'} style={{ lineHeight: '24px' }} onInput={onInput} aria-label="Notes" />);
    const field = screen.getByRole('textbox');
    expect(field).toHaveStyle({ height: '48px', overflowY: 'hidden' });
    fireEvent.input(field, { target: { value: 'one\ntwo\nthree' } });
    expect(field).toHaveStyle({ height: '72px', overflowY: 'hidden' });
    fireEvent.input(field, { target: { value: Array(9).fill('line').join('\n') } });
    expect(field).toHaveStyle({ height: '144px', overflowY: 'auto' });
    fireEvent.input(field, { target: { value: '' } });
    expect(field).toHaveStyle({ height: '24px', overflowY: 'hidden' });
    expect(onInput).toHaveBeenCalledTimes(3);
  });

  it('resizes controlled values and applies a changed maxRows limit', () => {
    mockContentHeight();
    const { rerender } = render(<TextArea autoResize value="Short" readOnly style={{ lineHeight: '24px' }} />);
    const field = screen.getByRole('textbox');
    rerender(<TextArea autoResize value={Array(9).fill('line').join('\n')} readOnly style={{ lineHeight: '24px' }} />);
    expect(field).toHaveStyle({ height: '144px', overflowY: 'auto' });
    rerender(<TextArea autoResize maxRows={3} value={Array(9).fill('line').join('\n')} readOnly style={{ lineHeight: '24px' }} />);
    expect(field).toHaveStyle({ height: '72px', overflowY: 'auto' });
    rerender(<TextArea autoResize value="Short again" readOnly style={{ lineHeight: '24px' }} />);
    expect(field).toHaveStyle({ height: '24px', overflowY: 'hidden' });
  });

  it('remeasures when the available width changes and disconnects on unmount', () => {
    let notifyResize: () => void;
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { notifyResize = callback; }
      observe() {}
      disconnect = disconnect;
    });
    let height = 48;
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(() => height);
    const { unmount } = render(<TextArea autoResize defaultValue="Text that wraps" style={{ lineHeight: '24px' }} />);
    const field = screen.getByRole('textbox');
    expect(field).toHaveStyle({ height: '48px' });
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);
    height = 96;
    notifyResize!();
    expect(field).toHaveStyle({ height: '96px' });
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('restores native sizing when autoResize is turned off and still forwards the ref', () => {
    mockContentHeight();
    const ref = createRef<HTMLTextAreaElement>();
    const { rerender } = render(<TextArea ref={ref} autoResize defaultValue="Notes" style={{ lineHeight: '24px' }} />);
    expect(ref.current).toHaveStyle({ height: '24px' });
    rerender(<TextArea ref={ref} rows={4} defaultValue="Notes" style={{ lineHeight: '24px' }} />);
    expect(ref.current?.rows).toBe(4);
    expect(ref.current?.style.height).toBe('');
    expect(ref.current?.style.overflowY).toBe('');
  });

  it('renders a native textarea inside a wrapper', () => {
    render(<TextArea aria-label="Notes" />);

    const field = screen.getByRole('textbox', { name: 'Notes' });
    expect(field.tagName).toBe('TEXTAREA');
    expect(field.parentElement?.tagName).toBe('DIV');
  });

  it('uses the default size, appearance, and resize', () => {
    render(<TextArea aria-label="Notes" />);

    const root = screen.getByRole('textbox').parentElement!;
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-appearance', 'default');
    expect(root).toHaveClass(styles.resize_vertical);
  });

  it('applies a selected size', () => {
    render(<TextArea size="lg" aria-label="Notes" />);

    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-size', 'lg');
  });

  it('applies a selected appearance', () => {
    render(<TextArea appearance="subtle" aria-label="Notes" />);

    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-appearance', 'subtle');
  });

  it('applies the inline appearance', () => {
    render(<TextArea appearance="inline" aria-label="Notes" />);

    const root = screen.getByRole('textbox').parentElement!;
    expect(root).toHaveAttribute('data-appearance', 'inline');
    expect(root).toHaveClass(styles.appearance_inline);
  });

  it('applies each resize option as a class on the wrapper', () => {
    const { rerender } = render(<TextArea resize="none" aria-label="Notes" />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass(styles.resize_none);

    rerender(<TextArea resize="both" aria-label="Notes" />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass(styles.resize_both);
  });

  it('sets aria-invalid on the textarea and data-invalid on the wrapper when invalid', () => {
    render(<TextArea invalid aria-label="Notes" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-invalid', 'true');
  });

  it('does not set aria-invalid by default', () => {
    render(<TextArea aria-label="Notes" />);

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('disables the textarea and marks the wrapper disabled', () => {
    render(<TextArea disabled aria-label="Notes" />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-disabled', 'true');
  });

  it('applies className to the wrapper', () => {
    render(<TextArea aria-label="Notes" className="custom-area" />);

    expect(screen.getByRole('textbox').parentElement).toHaveClass('custom-area');
  });

  it('forwards native textarea props (rows, placeholder, maxLength, onChange)', () => {
    const onChange = vi.fn();
    render(<TextArea aria-label="Notes" rows={6} placeholder="Type here" maxLength={100} onChange={onChange} />);

    const field = screen.getByRole('textbox', { name: 'Notes' });
    expect(field).toHaveAttribute('rows', '6');
    expect(field).toHaveAttribute('placeholder', 'Type here');
    expect(field).toHaveAttribute('maxlength', '100');

    fireEvent.change(field, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards the ref to the native textarea', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea aria-label="Notes" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('supports data-force-state for documentation purposes', () => {
    render(<TextArea aria-label="Notes" data-force-state="hover" />);

    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-force-state', 'hover');
  });

  it('renders iconAfter when provided', () => {
    render(<TextArea aria-label="Notes" iconAfter={<span data-testid="edit-icon">edit</span>} />);

    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon').parentElement).toHaveClass(styles.action);
  });

  it('does not render the action slot when iconAfter is absent', () => {
    const { container } = render(<TextArea aria-label="Notes" />);

    expect(container.querySelector(`.${styles.action}`)).toBeNull();
  });

  it('paints focus/invalid on appearance=default via box-shadow, not a real border-width change', () => {
    const focusRuleMatch = textAreaCss.match(
      /\.appearance_default:is\(:focus-within, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/,
    );
    const invalidRuleMatch = textAreaCss.match(/\.root\[data-invalid='true'\]\s*\{([^}]*)\}/);

    expect(focusRuleMatch?.[1]).toContain('border-color: var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 1px var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).not.toContain('border-width');

    expect(invalidRuleMatch?.[1]).toContain('border-color: var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 1px var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).not.toContain('border-width');
  });

  it('suppresses the hover background once the field is focused', () => {
    expect(textAreaCss).toContain(":not([data-disabled='true']):not(:focus-within):not([data-force-state='focus']):is(:hover, [data-force-state='hover'])");
  });

  it('reuses Text Field semantic tokens for surface, border, and radius', () => {
    expect(textAreaCss).toContain('background: var(--color-elevation-surface-raised-default);');
    expect(textAreaCss).toContain('border: var(--border-width-sm) solid var(--color-border-input);');
    expect(textAreaCss).toContain('--text-area-radius: var(--border-radius-xl);');
  });

  it('rests appearance=subtle at a 1px bottom-only border, painting the thicker focus/invalid edge via box-shadow', () => {
    expect(textAreaCss).toMatch(/\.appearance_subtle\s*\{[^}]*border-width:\s*0 0 var\(--border-width-sm\) 0;/);

    const focusRuleMatch = textAreaCss.match(/\.appearance_subtle:is\(:focus-within, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/);
    expect(focusRuleMatch?.[1]).toContain('border-bottom-color: var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 -1px 0 0 var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).not.toContain('border-bottom-width');
  });

  it('inline appearance is chromeless at rest with subtle-style bottom-only states', () => {
    expect(textAreaCss).toMatch(/\.appearance_inline\s*\{[^}]*border-color:\s*transparent;/);
    expect(textAreaCss).toMatch(/\.appearance_inline\s*\{[^}]*background:\s*transparent;/);
    expect(textAreaCss).toMatch(/\.appearance_inline\s*\{[^}]*border-width:\s*0 0 var\(--border-width-sm\) 0;/);
    expect(textAreaCss).toMatch(/\.appearance_inline[^{]*:focus-within[^{]*\{[^}]*border-bottom-color:\s*var\(--color-border-focus\)/);
    expect(textAreaCss).toMatch(/\.appearance_inline\[data-invalid[^{]*\{[^}]*border-bottom-color:\s*var\(--color-border-error\)/);
  });

  it('disables resize on a disabled wrapper', () => {
    expect(textAreaCss).toMatch(/\.root\[data-disabled='true'\]\s*\{[^}]*resize:\s*none;/);
  });
});
