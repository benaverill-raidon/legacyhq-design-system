import * as React from 'react';
import { CaretDownIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { DropdownMenu } from '../../organisms/dropdown-menu';
import styles from './split-button.module.css';
import type { SplitButtonProps } from './split-button.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  {
    children,
    onClick,
    sections,
    secondaryActionLabel,
    appearance = 'default',
    size = 'md',
    tone,
    disabled = false,
    isLoading = false,
    iconBefore,
    iconAfter,
    id,
    className,
    ...rest
  },
  forwardedRef,
) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      id={id}
      className={mergeClassNames(styles.root, styles['appearance_' + appearance], styles['size_' + size], className)}
    >
      <Button
        {...rest}
        ref={forwardedRef}
        className={styles.primaryAction}
        appearance={appearance}
        tone={tone}
        size={size}
        disabled={disabled}
        isLoading={isLoading}
        iconBefore={iconBefore}
        iconAfter={iconAfter}
        onClick={onClick}
      >
        {children}
      </Button>
      <span className={styles.divider} data-disabled={disabled ? 'true' : undefined} aria-hidden="true" />
      <DropdownMenu
        aria-label={secondaryActionLabel}
        open={open}
        onOpenChange={setOpen}
        showSearch={false}
        alignment="right"
        sections={sections}
      >
        <IconButton
          className={styles.secondaryAction}
          appearance={appearance}
          size={size}
          shape="square"
          disabled={disabled || isLoading}
          aria-label={secondaryActionLabel}
          onClick={() => setOpen((current) => !current)}
        >
          <CaretDownIcon size="md" decorative />
        </IconButton>
      </DropdownMenu>
    </div>
  );
});

SplitButton.displayName = 'SplitButton';
