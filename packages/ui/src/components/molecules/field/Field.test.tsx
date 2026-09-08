// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { TextField } from '../text-field';
import { Field } from './field';
import fieldStyles from './field.module.css';

const fieldCss = readFileSync('packages/ui/src/components/molecules/field/field.module.css', 'utf8');

afterEach(cleanup);

describe('Field', () => {
  it('gives the wrapped control its accessible name via a real <label htmlFor>', () => {
    render(
      <Field label="Email">
        <TextField type="email" />
      </Field>,
    );

    // No aria-label on the control - the name comes entirely from the label/htmlFor wiring.
    const input = screen.getByRole('textbox', { name: 'Email' });
    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', input.id);
    expect(input.id).toBeTruthy();
  });

  it('keeps the control_s own id instead of overriding it', () => {
    render(
      <Field label="Email">
        <TextField id="custom-id" aria-label="Email" />
      </Field>,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(screen.getByText('Email')).toHaveAttribute('for', 'custom-id');
  });

  it('links the message to the control via aria-describedby', () => {
    render(
      <Field label="Email" message="We'll only use this to contact you.">
        <TextField aria-label="Email" />
      </Field>,
    );

    const input = screen.getByRole('textbox');
    const message = screen.getByText("We'll only use this to contact you.");
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(message.closest(`#${describedBy}`)).not.toBeNull();
  });

  it('merges the message id with an aria-describedby the control already has', () => {
    render(
      <Field label="Email" message="Helper">
        <TextField aria-label="Email" aria-describedby="existing-desc" />
      </Field>,
    );

    const describedBy = screen.getByRole('textbox').getAttribute('aria-describedby') ?? '';
    expect(describedBy.split(' ')).toContain('existing-desc');
    expect(describedBy.split(' ').length).toBe(2);
  });

  it('sets aria-invalid on the control when state is error', () => {
    render(
      <Field label="Email" state="error" message="Required">
        <TextField aria-label="Email" />
      </Field>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when state is not error', () => {
    render(
      <Field label="Email" state="valid" message="Looks good">
        <TextField aria-label="Email" />
      </Field>,
    );

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('lets the control_s own aria-invalid win over the field state', () => {
    render(
      <Field label="Email" state="error">
        <TextField aria-label="Email" aria-invalid={false} />
      </Field>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('marks required: forwards required to the control and shows a decorative asterisk', () => {
    render(
      <Field label="Password" required>
        <TextField />
      </Field>,
    );

    expect(screen.getByRole('textbox')).toBeRequired();

    // The asterisk is decorative, so it is aria-hidden - the forwarded native `required` conveys the
    // requirement. That also means it is not part of the control's accessible name ("Password", not
    // "Password *").
    const asterisk = screen.getByText('*');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render an asterisk or forward required when not required', () => {
    render(
      <Field label="Name">
        <TextField />
      </Field>,
    );

    expect(screen.queryByText('*')).toBeNull();
    expect(screen.getByRole('textbox')).not.toBeRequired();
  });

  it('renders a status icon for error and valid, but not for default', () => {
    const { container: errorContainer } = render(
      <Field label="Email" state="error" message="Required">
        <TextField aria-label="Email" />
      </Field>,
    );
    expect(errorContainer.querySelector(`.${fieldStyles.messageIcon}`)).not.toBeNull();
    cleanup();

    const { container: validContainer } = render(
      <Field label="Email" state="valid" message="Good">
        <TextField aria-label="Email" />
      </Field>,
    );
    expect(validContainer.querySelector(`.${fieldStyles.messageIcon}`)).not.toBeNull();
    cleanup();

    const { container: defaultContainer } = render(
      <Field label="Email" message="Helper">
        <TextField aria-label="Email" />
      </Field>,
    );
    expect(defaultContainer.querySelector(`.${fieldStyles.messageIcon}`)).toBeNull();
  });

  it('sets data-state, data-context, and data-size on the root, defaulting sensibly', () => {
    const { container } = render(
      <Field label="Email">
        <TextField aria-label="Email" />
      </Field>,
    );

    const root = container.querySelector(`.${fieldStyles.root}`);
    expect(root).toHaveAttribute('data-state', 'default');
    expect(root).toHaveAttribute('data-context', 'default');
    expect(root).toHaveAttribute('data-size', 'md');
  });

  it('applies selected state, context, and size to the root', () => {
    const { container } = render(
      <Field label="Email" state="error" context="inline" size="lg">
        <TextField aria-label="Email" />
      </Field>,
    );

    const root = container.querySelector(`.${fieldStyles.root}`);
    expect(root).toHaveAttribute('data-state', 'error');
    expect(root).toHaveAttribute('data-context', 'inline');
    expect(root).toHaveAttribute('data-size', 'lg');
  });

  it('renders the control inline (appearance="subtle") when context is inline', () => {
    render(
      <Field label="Email" context="inline">
        <TextField aria-label="Email" />
      </Field>,
    );

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-appearance', 'subtle');
  });

  it('does not change the control appearance in the default context', () => {
    render(
      <Field label="Email" context="default">
        <TextField aria-label="Email" />
      </Field>,
    );

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-appearance', 'default');
  });

  it('lets the control_s own appearance win over the inline context', () => {
    render(
      <Field label="Email" context="inline">
        <TextField aria-label="Email" appearance="default" />
      </Field>,
    );

    expect(screen.getByRole('textbox').closest('div')).toHaveAttribute('data-appearance', 'default');
  });

  it('renders no <label> when label is omitted', () => {
    render(
      <Field message="Helper">
        <TextField aria-label="Email" />
      </Field>,
    );

    expect(screen.queryByText('Email')).toBeNull();
    // The control keeps its own accessible name.
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('renders no message and adds no aria-describedby when message is omitted', () => {
    render(
      <Field label="Email">
        <TextField />
      </Field>,
    );

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('composes className, labelClassName, and messageClassName', () => {
    const { container } = render(
      <Field
        label="Email"
        message="Helper"
        className="custom-root"
        labelClassName="custom-label"
        messageClassName="custom-message"
      >
        <TextField aria-label="Email" />
      </Field>,
    );

    expect(container.querySelector(`.${fieldStyles.root}`)).toHaveClass('custom-root');
    expect(screen.getByText('Email')).toHaveClass('custom-label');
    // "Helper" sits in the inner .messageText span; the class is on the outer .message container.
    expect(screen.getByText('Helper').closest(`.${fieldStyles.message}`)).toHaveClass('custom-message');
  });

  it('forwards data-force-state to the wrapped control', () => {
    render(
      <Field label="Email" data-force-state="focus">
        <input aria-label="Email" />
      </Field>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('data-force-state', 'focus');
  });

  it('uses semantic typography tokens for the label and message', () => {
    expect(fieldCss).toContain('font-size: var(--typography-heading-xxs-font-size);');
    expect(fieldCss).toContain('font-size: var(--typography-body-sm-font-size);');
  });

  it('recolours the message per state with content tokens', () => {
    expect(fieldCss).toMatch(/\.state_error \.message\s*\{\s*color: var\(--color-content-error\);/);
    expect(fieldCss).toMatch(/\.state_valid \.message\s*\{\s*color: var\(--color-content-success\);/);
  });

  it('indents the inline context to match the control_s inner padding per size', () => {
    expect(fieldCss).toMatch(/\.context_inline\.size_lg[^{]*\{\s*padding-inline-start: var\(--spacing-md\);/);
    expect(fieldCss).toContain('padding-inline-start: var(--spacing-sm);');
  });
});
