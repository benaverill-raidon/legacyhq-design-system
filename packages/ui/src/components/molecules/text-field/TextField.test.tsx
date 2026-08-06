// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextField } from './text-field';

const textFieldCss = readFileSync(
  'packages/ui/src/components/molecules/text-field/text-field.module.css',
  'utf8',
);

afterEach(cleanup);

describe('TextField', () => {
  it('renders a native input', () => {
    render(<TextField aria-label="Name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.tagName).toBe('INPUT');
  });

  it('uses the default size and appearance', () => {
    render(<TextField aria-label="Name" />);

    const wrapper = screen.getByRole('textbox').closest('div');
    expect(wrapper).toHaveAttribute('data-size', 'md');
    expect(wrapper).toHaveAttribute('data-appearance', 'default');
  });

  it('applies a selected size', () => {
    render(<TextField size="lg" aria-label="Name" />);

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-size', 'lg');
  });

  it('applies a selected appearance', () => {
    render(<TextField appearance="subtle" aria-label="Name" />);

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-appearance', 'subtle');
  });

  it('sets aria-invalid and data-invalid when invalid', () => {
    render(<TextField invalid aria-label="Name" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-invalid', 'true');
  });

  it('does not set aria-invalid by default', () => {
    render(<TextField aria-label="Name" />);

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('disables the input and marks the frame disabled', () => {
    render(<TextField disabled aria-label="Name" />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders iconBefore and iconAfter', () => {
    render(
      <TextField
        aria-label="Name"
        iconBefore={<span data-testid="icon-before" />}
        iconAfter={<span data-testid="icon-after" />}
      />,
    );

    expect(screen.getByTestId('icon-before')).toBeInTheDocument();
    expect(screen.getByTestId('icon-after')).toBeInTheDocument();
  });

  it('hides iconBefore from the accessibility tree (always decorative)', () => {
    render(<TextField aria-label="Name" iconBefore={<span data-testid="icon-before" />} />);

    expect(screen.getByTestId('icon-before').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not hide iconAfter from the accessibility tree (may be an interactive action)', () => {
    render(
      <TextField
        aria-label="Name"
        iconAfter={
          <button type="button" aria-label="Clear">
            x
          </button>
        }
      />,
    );

    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton.closest('[aria-hidden]')).toBeNull();
  });

  it('applies className to the root frame and inputClassName to the input', () => {
    render(<TextField aria-label="Name" className="custom-root" inputClassName="custom-input" />);

    expect(screen.getByRole('textbox').closest('div')).toHaveClass('custom-root');
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('forwards native input props', () => {
    const onChange = vi.fn();
    render(<TextField aria-label="Name" type="email" placeholder="you@example.com" onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');

    fireEvent.change(input, { target: { value: 'a@b.com' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards the ref to the native input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField aria-label="Name" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('supports data-force-state for documentation purposes', () => {
    render(<TextField aria-label="Name" data-force-state="hover" />);

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-force-state', 'hover');
  });

  it('replaces the border color on focus, the same way invalid does, instead of adding an outline', () => {
    expect(textFieldCss).not.toContain('outline-offset');
    expect(textFieldCss).not.toMatch(/outline:\s*var\(--border-width/);
    expect(textFieldCss).toContain('border-color: var(--color-border-focused);');
  });

  it('paints focus/invalid on appearance=default via box-shadow, not a real border-width change (avoids shifting the text/caret)', () => {
    const focusRuleMatch = textFieldCss.match(
      /\.appearance_default:is\(:focus-within, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/,
    );
    const invalidRuleMatch = textFieldCss.match(/\.root\[data-invalid='true'\]\s*\{([^}]*)\}/);

    expect(focusRuleMatch?.[1]).toContain('border-color: var(--color-border-focused);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 1px var(--color-border-focused);');
    expect(focusRuleMatch?.[1]).not.toContain('border-width');

    expect(invalidRuleMatch?.[1]).toContain('border-color: var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 1px var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).not.toContain('border-width');
  });

  it('suppresses the hover background once the field is focused/typing', () => {
    expect(textFieldCss).toContain(
      ":not(:focus-within):not([data-force-state='focus']):is(:hover, [data-force-state='hover'])",
    );
  });

  it('uses semantic tokens for size and radius', () => {
    expect(textFieldCss).toContain('--text-field-height: var(--size-control-sm);');
    expect(textFieldCss).toContain('--text-field-height: var(--size-control-lg);');
    expect(textFieldCss).toContain('--text-field-radius: var(--border-radius-xl);');
  });

  it('rests appearance=subtle at the same 1px border-width as the default appearance', () => {
    expect(textFieldCss).toContain('.appearance_subtle {');
    expect(textFieldCss).toMatch(/\.appearance_subtle\s*\{[^}]*border-width:\s*0 0 var\(--border-width-sm\) 0;/);
  });

  it('never lets hover mask the invalid border color on appearance=subtle', () => {
    expect(textFieldCss).toMatch(
      /\.appearance_subtle:not\(\[data-disabled='true'\]\):not\(\[data-invalid='true'\]\):not\(:focus-within\):not\(\[data-force-state='focus'\]\):is\(:hover, \[data-force-state='hover'\]\)\s*\{\s*border-bottom-color: var\(--color-border-input\);/,
    );
  });

  it('paints a thicker focus/invalid border on appearance=subtle via box-shadow, not a real border-width change (avoids shifting the text)', () => {
    const focusRuleMatch = textFieldCss.match(
      /\.appearance_subtle:is\(:focus-within, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/,
    );
    const invalidRuleMatch = textFieldCss.match(/\.appearance_subtle\[data-invalid='true'\]\s*\{([^}]*)\}/);

    expect(focusRuleMatch?.[1]).toContain('border-bottom-color: var(--color-border-focused);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 -1px 0 0 var(--color-border-focused);');
    expect(focusRuleMatch?.[1]).not.toContain('border-bottom-width');

    expect(invalidRuleMatch?.[1]).toContain('box-shadow: inset 0 -1px 0 0 var(--color-border-error);');
    // `.root[data-invalid='true']` no longer touches border-width at all (it uses box-shadow too),
    // so this rule doesn't need to override border-bottom-width back to anything.
    expect(invalidRuleMatch?.[1]).not.toContain('border-bottom-width');
  });
});
