// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../../molecules/field';
import { TextField } from '../../molecules/text-field';
import { Form, FormSection, FormRow, FormFooter } from './form';
import styles from './form.module.css';

const formCss = readFileSync('packages/ui/src/components/organisms/form/form.module.css', 'utf8');

afterEach(cleanup);

describe('Form', () => {
  it('renders a native <form>', () => {
    const { container } = render(
      <Form>
        <Field label="Name">
          <TextField />
        </Field>
      </Form>,
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form).toHaveClass(styles.root);
  });

  it('renders the header title and description', () => {
    render(<Form title="Create a new repository" description="Fill in the details below." />);

    expect(screen.getByText('Create a new repository')).toBeInTheDocument();
    expect(screen.getByText('Fill in the details below.')).toBeInTheDocument();
  });

  it('renders the required-field legend with a coloured asterisk', () => {
    const { container } = render(<Form title="Sign up" requiredLegend />);

    expect(screen.getByText(/indicates a required field/)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.requiredMark}`)).toHaveTextContent('*');
  });

  it('renders no header when there is no title, description, or legend', () => {
    const { container } = render(
      <Form>
        <Field label="Name">
          <TextField />
        </Field>
      </Form>,
    );

    expect(container.querySelector(`.${styles.header}`)).toBeNull();
  });

  it('fires onSubmit', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const { container } = render(
      <Form onSubmit={onSubmit}>
        <FormFooter>
          <button type="submit">Go</button>
        </FormFooter>
      </Form>,
    );

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('forwards the ref and native form attributes', () => {
    const ref = createRef<HTMLFormElement>();
    const { container } = render(<Form ref={ref} name="signup" noValidate />);

    expect(ref.current).toBeInstanceOf(HTMLFormElement);
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('name', 'signup');
    expect(form).toHaveAttribute('novalidate');
  });

  it('composes className and headerClassName', () => {
    const { container } = render(<Form title="Title" className="custom-root" headerClassName="custom-header" />);

    expect(container.querySelector('form')).toHaveClass('custom-root');
    expect(container.querySelector(`.${styles.header}`)).toHaveClass('custom-header');
  });

  it('uses semantic tokens for the header typography', () => {
    expect(formCss).toContain('font-size: var(--typography-heading-lg-font-size);');
    expect(formCss).toContain('font-size: var(--typography-body-md-font-size);');
  });
});

describe('FormSection', () => {
  it('renders an optional title and its children', () => {
    render(
      <FormSection title="General">
        <Field label="Name">
          <TextField />
        </Field>
      </FormSection>,
    );

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('renders no title when omitted', () => {
    const { container } = render(
      <FormSection>
        <Field label="Name">
          <TextField />
        </Field>
      </FormSection>,
    );

    expect(container.querySelector(`.${styles.sectionTitle}`)).toBeNull();
  });

  it('separates sections from the content above with top spacing', () => {
    expect(formCss).toMatch(/\.section\s*\{[^}]*padding-block-start: var\(--spacing-3xl\);/);
  });
});

describe('FormRow', () => {
  it('renders its fields as equal-width columns', () => {
    const { container } = render(
      <FormRow>
        <Field label="First">
          <TextField />
        </Field>
        <Field label="Last">
          <TextField />
        </Field>
      </FormRow>,
    );

    expect(container.querySelector(`.${styles.row}`)).not.toBeNull();
    expect(screen.getByRole('textbox', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Last' })).toBeInTheDocument();
    // Direct children are made equal columns via CSS.
    expect(formCss).toMatch(/\.row > \*\s*\{[^}]*flex: 1 1 0;/);
  });
});

describe('FormFooter', () => {
  it('defaults to end alignment', () => {
    const { container } = render(
      <FormFooter>
        <button type="submit">Save</button>
      </FormFooter>,
    );

    expect(container.querySelector(`.${styles.footer}`)).toHaveAttribute('data-align', 'end');
  });

  it('supports start alignment', () => {
    const { container } = render(
      <FormFooter align="start">
        <button type="submit">Save</button>
      </FormFooter>,
    );

    expect(container.querySelector(`.${styles.footer}`)).toHaveAttribute('data-align', 'start');
  });

  it('separates the footer from the content above with top spacing', () => {
    expect(formCss).toMatch(/\.footer\s*\{[^}]*padding-block-start: var\(--spacing-4xl\);/);
  });
});
