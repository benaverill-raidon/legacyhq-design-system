import * as React from 'react';
import styles from './form.module.css';
import type { FormFooterProps, FormProps, FormRowProps, FormSectionProps } from './form.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Form is a layout organism: a native `<form>` with an optional header (title, description, and the
 * required-field legend) that arranges FormSection / FormRow groups and a FormFooter. It owns
 * spacing and the header only - the actual controls come from Field (and its wrapped Text Field,
 * Select, etc.) passed in as children - so onSubmit, validation, and each field's state stay native
 * / the consumer's own.
 */
export const Form = React.memo(
  React.forwardRef<HTMLFormElement, FormProps>(function Form(
    { title, description, requiredLegend = false, children, className, headerClassName, ...rest },
    forwardedRef,
  ) {
    const hasHeader = title != null || description != null || requiredLegend;

    return (
      <form {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)}>
        {hasHeader ? (
          <div className={mergeClassNames(styles.header, headerClassName)}>
            {title != null ? <div className={styles.title}>{title}</div> : null}
            {description != null ? <p className={styles.description}>{description}</p> : null}
            {requiredLegend ? (
              <p className={styles.description}>
                {/* Not aria-hidden: this legend explains what the `*` means, so it is real content. */}
                <span className={styles.requiredMark}>*</span> indicates a required field
              </p>
            ) : null}
          </div>
        ) : null}

        {children}
      </form>
    );
  }),
);

Form.displayName = 'Form';

/** A vertical group of fields, with an optional heading. Stack Fields or FormRows inside it. */
export const FormSection = React.memo(function FormSection({
  title,
  children,
  className,
  titleClassName,
  ...rest
}: FormSectionProps) {
  return (
    <div {...rest} className={mergeClassNames(styles.section, className)}>
      {title != null ? <div className={mergeClassNames(styles.sectionTitle, titleClassName)}>{title}</div> : null}
      {children}
    </div>
  );
});

FormSection.displayName = 'FormSection';

/** Lays its children out as equal-width columns on one line (up to 4), collapsing to one on narrow viewports. */
export const FormRow = React.memo(function FormRow({ children, className, ...rest }: FormRowProps) {
  return (
    <div {...rest} className={mergeClassNames(styles.row, className)}>
      {children}
    </div>
  );
});

FormRow.displayName = 'FormRow';

/** The form actions, aligned to the end (right) by default or the start (left). */
export const FormFooter = React.memo(function FormFooter({
  align = 'end',
  children,
  className,
  ...rest
}: FormFooterProps) {
  return (
    <div {...rest} className={mergeClassNames(styles.footer, className)} data-align={align}>
      {children}
    </div>
  );
});

FormFooter.displayName = 'FormFooter';
