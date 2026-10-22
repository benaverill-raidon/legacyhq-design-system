// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextField } from './text-field';
import textFieldStyles from './text-field.module.css';

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

  it('uses the default size and context', () => {
    render(<TextField aria-label="Name" />);

    const wrapper = screen.getByRole('textbox').closest('div');
    expect(wrapper).toHaveAttribute('data-size', 'md');
    expect(wrapper).toHaveAttribute('data-context', 'default');
  });

  it('applies a selected size', () => {
    render(<TextField size="lg" aria-label="Name" />);

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-size', 'lg');
  });

  it('applies the inline context', () => {
    render(<TextField context="inline" aria-label="Name" />);

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-context', 'inline');
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
    expect(textFieldCss).toContain('border-color: var(--color-border-focus);');
  });

  it('paints focus/invalid on context=default via box-shadow, not a real border-width change (avoids shifting the text/caret)', () => {
    const focusRuleMatch = textFieldCss.match(
      /\.context_default:is\(:focus-within, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/,
    );
    const invalidRuleMatch = textFieldCss.match(/\.root\[data-invalid='true'\]\s*\{([^}]*)\}/);

    expect(focusRuleMatch?.[1]).toContain('border-color: var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm)) var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).not.toMatch(/(^|[\s;])border-width\s*:/);

    expect(invalidRuleMatch?.[1]).toContain('border-color: var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).toContain('box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm)) var(--color-border-error);');
    expect(invalidRuleMatch?.[1]).not.toMatch(/(^|[\s;])border-width\s*:/);
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

  it('rests context=inline at the same 1px border-width as the default context', () => {
    expect(textFieldCss).toContain('.context_inline {');
    expect(textFieldCss).toMatch(/\.context_inline\s*\{[^}]*border-width:\s*0 0 var\(--border-width-sm\) 0;/);
  });

  it('never lets hover mask the invalid border color on context=inline', () => {
    expect(textFieldCss).toMatch(
      /\.context_inline:not\(\[data-disabled='true'\], :where\(:has\(\.input:disabled\)\)\):not\(\[data-invalid='true'\]\):not\(:focus-within\):not\(\[data-force-state='focus'\]\):is\(:hover, \[data-force-state='hover'\]\)\s*\{\s*border-bottom-color: var\(--color-border-input\);/,
    );
  });

  it('paints a thicker focus/invalid border on context=inline via box-shadow, not a real border-width change (avoids shifting the text)', () => {
    const focusRuleMatch = textFieldCss.match(
      /\.context_inline:is\(:focus-within, \[data-force-state='focus'\]\)\s*\{([^}]*)\}/,
    );
    const invalidRuleMatch = textFieldCss.match(/\.context_inline\[data-invalid='true'\]\s*\{([^}]*)\}/);

    expect(focusRuleMatch?.[1]).toContain('border-bottom-color: var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).toContain('box-shadow: inset 0 calc(-1 * (var(--border-width-md) - var(--border-width-sm))) 0 0 var(--color-border-focus);');
    expect(focusRuleMatch?.[1]).not.toContain('border-bottom-width');

    expect(invalidRuleMatch?.[1]).toContain('box-shadow: inset 0 calc(-1 * (var(--border-width-md) - var(--border-width-sm))) 0 0 var(--color-border-error);');
    // `.root[data-invalid='true']` no longer touches border-width at all (it uses box-shadow too),
    // so this rule doesn't need to override border-bottom-width back to anything.
    expect(invalidRuleMatch?.[1]).not.toContain('border-bottom-width');
  });

  describe('leadingContent slot', () => {
    it('renders interactive in-frame content between the leading icon and the input, not aria-hidden', () => {
      render(
        <TextField
          aria-label="Tags"
          leadingContent={<button type="button">a token</button>}
        />,
      );

      // Unlike the decorative `iconBefore` slot, this holds real controls and stays reachable.
      const token = screen.getByRole('button', { name: 'a token' });
      expect(token).toBeInTheDocument();
      expect(token.closest('[aria-hidden="true"]')).toBeNull();

      // It sits ahead of the input inside the same frame.
      const input = screen.getByRole('textbox', { name: 'Tags' });
      expect(token.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('renders nothing for the slot when leadingContent is omitted', () => {
      const { container } = render(<TextField aria-label="Name" />);

      expect(container.querySelector(`.${textFieldStyles.leadingContent}`)).toBeNull();
    });

    it('keeps the slot single-line: shrinks and clips rather than growing', () => {
      const rule = textFieldCss.match(/\.leadingContent\s*\{([^}]*)\}/);

      expect(rule?.[1]).toContain('flex: 0 1 auto;');
      expect(rule?.[1]).toContain('overflow: hidden;');
    });
  });

  it('maps the deprecated appearance values to a context', () => {
    const { rerender } = render(<TextField appearance="subtle" aria-label="Name" />);
    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-context', 'inline');
    rerender(<TextField appearance="inline" aria-label="Name" />);
    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-context', 'inline');
    rerender(<TextField appearance="default" aria-label="Name" />);
    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-context', 'default');
  });

  it('has one inline look, Figma\'s: no separate chromeless-without-hover duplicate', () => {
    expect(textFieldCss).not.toMatch(/appearance_/);
    expect(textFieldCss).toMatch(/\.context_inline:not\(\[data-disabled='true'\], :where\(:has\(\.input:disabled\)\)\)[^{]*:is\(:hover, \[data-force-state='hover'\]\)\s*\{\s*background: var\(--color-elevation-surface-raised-hover\);/);
  });

  describe('autofill', () => {
    const css = textFieldCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const frameRule = css.match(/([^{}]*:has\(\.input:autofill\)[^{}]*)\{([^}]*)\}/);
    // Split the selector list at its top-level commas, not the ones inside :is().
    const selectors = frameRule?.[1].trim().split(/,\s*(?=\.context_)/) ?? [];
    const inputRule = css.match(/\.input:autofill\s*\{([^}]*)\}/);

    it('layers the autofill token over the raised surface, as Figma does', () => {
      expect(frameRule?.[2]).toContain(
        'background: linear-gradient(var(--color-background-autofill-default), var(--color-background-autofill-default)), var(--color-elevation-surface-raised-default);',
      );
    });

    it('shows the tint on context=default whenever the input is autofilled or pinned, except when disabled', () => {
      expect(selectors[0]).toBe(".context_default:not([data-disabled='true'], :where(:has(.input:disabled))):is(:has(.input:autofill), [data-force-state='autofill'])");
    });

    it('keeps context=inline chromeless at rest: the tint shows only while focused', () => {
      expect(selectors).toHaveLength(2);
      expect(selectors[1]).toBe(
        ".context_inline:not([data-disabled='true'], :where(:has(.input:disabled))):is(:has(.input:autofill), [data-force-state='autofill']):focus-within",
      );
    });

    it("keeps each context's resting stroke, as Figma does", () => {
      expect(frameRule?.[2]).not.toMatch(/border|box-shadow/);
    });

    it('lets hover replace the tint: the hover rules outrank it and set the background shorthand, which clears it', () => {
      const hoverRule = (context: string) =>
        css.match(new RegExp(`\\.${context}:not\\(\\[data-disabled='true'\\], :where\\(:has\\(\\.input:disabled\\)\\)\\):not\\(:focus-within\\)[^{]*:is\\(:hover, \\[data-force-state='hover'\\]\\)\\s*\\{([^}]*)\\}`))?.[1];

      expect(hoverRule('root')).toContain('background: var(--color-elevation-surface-raised-hover);');
      expect(hoverRule('context_inline')).toContain('background: var(--color-elevation-surface-raised-hover);');
    });

    it("hides the browser's own autofill fill by clipping the input's background to its text", () => {
      expect(inputRule?.[1]).toContain('-webkit-background-clip: text;');
      expect(inputRule?.[1]).toContain('background-clip: text;');
      expect(inputRule?.[1]).toContain('-webkit-text-fill-color: var(--color-content-default);');
      expect(inputRule?.[1]).toContain('caret-color: var(--color-content-default);');
      expect(css).toMatch(/\.input:autofill:disabled\s*\{\s*-webkit-text-fill-color: var\(--color-content-disabled\);/);
    });

    it('adds no motion of its own', () => {
      // `autofill` inside a selector, not the token name inside a declaration.
      expect(css).not.toMatch(/(^|\})[^{}]*autofill[^{}]*\{[^}]*(transition|animation)/);
    });

    it('pins the autofill state on the frame for documentation', () => {
      render(<TextField aria-label="Email" defaultValue="jordan@example.com" data-force-state="autofill" />);

      expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-force-state', 'autofill');
    });
  });
});
