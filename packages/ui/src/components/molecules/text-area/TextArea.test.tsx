// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextArea } from './text-area';
import styles from './text-area.module.css';

const textAreaCss = readFileSync('packages/ui/src/components/molecules/text-area/text-area.module.css', 'utf8');

afterEach(cleanup);

describe('TextArea', () => {
  it('renders a native textarea', () => {
    render(<TextArea aria-label="Notes" />);

    const field = screen.getByRole('textbox', { name: 'Notes' });
    expect(field.tagName).toBe('TEXTAREA');
  });

  it('uses the default size, appearance, and resize', () => {
    render(<TextArea aria-label="Notes" />);

    const field = screen.getByRole('textbox');
    expect(field).toHaveAttribute('data-size', 'md');
    expect(field).toHaveAttribute('data-appearance', 'default');
    expect(field).toHaveClass(styles.resize_vertical);
  });

  it('applies a selected size', () => {
    render(<TextArea size="lg" aria-label="Notes" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('data-size', 'lg');
  });

  it('applies a selected appearance', () => {
    render(<TextArea appearance="subtle" aria-label="Notes" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('data-appearance', 'subtle');
  });

  it('applies each resize option as a class', () => {
    const { rerender } = render(<TextArea resize="none" aria-label="Notes" />);
    expect(screen.getByRole('textbox')).toHaveClass(styles.resize_none);

    rerender(<TextArea resize="both" aria-label="Notes" />);
    expect(screen.getByRole('textbox')).toHaveClass(styles.resize_both);
  });

  it('sets aria-invalid and data-invalid when invalid', () => {
    render(<TextArea invalid aria-label="Notes" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('data-invalid', 'true');
  });

  it('does not set aria-invalid by default', () => {
    render(<TextArea aria-label="Notes" />);

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('disables the textarea and marks it disabled', () => {
    render(<TextArea disabled aria-label="Notes" />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveAttribute('data-disabled', 'true');
  });

  it('applies className to the textarea', () => {
    render(<TextArea aria-label="Notes" className="custom-area" />);

    expect(screen.getByRole('textbox')).toHaveClass('custom-area');
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

    expect(screen.getByRole('textbox')).toHaveAttribute('data-force-state', 'hover');
  });

  it('paints focus/invalid on appearance=default via box-shadow, not a real border-width change (avoids shifting the text/caret)', () => {
    const focusRuleMatch = textAreaCss.match(
      /\.appearance_default:is\(:focus, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/,
    );
    const invalidRuleMatch = textAreaCss.match(/\.textarea\[data-invalid='true'\]\s*\{([^}]*)\}/);

    expect(focusRuleMatch?.[1]).toContain('border-color: var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 1px var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).not.toContain('border-width');

    expect(invalidRuleMatch?.[1]).toContain('border-color: var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 1px var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).not.toContain('border-width');
  });

  it('suppresses the hover background once the field is focused', () => {
    expect(textAreaCss).toContain(":not(:disabled):not(:focus):not([data-force-state='focus']):is(:hover, [data-force-state='hover'])");
  });

  it('reuses Text Field semantic tokens for surface, border, and radius', () => {
    expect(textAreaCss).toContain('background: var(--color-elevation-surface-raised-default);');
    expect(textAreaCss).toContain('border: var(--border-width-sm) solid var(--color-border-input);');
    expect(textAreaCss).toContain('--text-area-radius: var(--border-radius-xl);');
  });

  it('rests appearance=subtle at a 1px bottom-only border, painting the thicker focus/invalid edge via box-shadow', () => {
    expect(textAreaCss).toMatch(/\.appearance_subtle\s*\{[^}]*border-width:\s*0 0 var\(--border-width-sm\) 0;/);

    const focusRuleMatch = textAreaCss.match(/\.appearance_subtle:is\(:focus, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/);
    expect(focusRuleMatch?.[1]).toContain('border-bottom-color: var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 -1px 0 0 var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).not.toContain('border-bottom-width');
  });

  it('disables the resize grip on a disabled field', () => {
    expect(textAreaCss).toMatch(/\.textarea:disabled\s*\{[^}]*resize:\s*none;/);
  });
});
