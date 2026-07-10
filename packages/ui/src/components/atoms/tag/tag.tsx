import * as React from 'react';
import { CloseIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './tag.module.css';
import type { TagProps } from './tag.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function getTagRel(target: React.HTMLAttributeAnchorTarget | undefined, rel: string | undefined) {
  if (target !== '_blank' || rel) {
    return rel;
  }

  return 'noopener noreferrer';
}

export function getTagRemoveLabel(removeLabel: string | undefined, children: React.ReactNode) {
  if (removeLabel) {
    return removeLabel;
  }

  if (typeof children === 'string') {
    return 'Remove ' + children;
  }

  return 'Remove tag';
}

function renderTagInnerContent(elemBefore: React.ReactNode, children: React.ReactNode) {
  return (
    <>
      {elemBefore ? <span className={styles.elemBefore}>{elemBefore}</span> : null}
      <span className={styles.text}>{children}</span>
    </>
  );
}

export const Tag = React.memo(
  React.forwardRef<HTMLElement, TagProps>(function Tag(
    {
      size = 'md',
      tone = 'standard',
      href,
      target,
      rel,
      isRemovable = false,
      isDisabled = false,
      elemBefore,
      onRemove,
      removeLabel,
      children,
      className,
      onClick,
      tabIndex,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    forwardedRef,
  ) {
    const rootClassName = mergeClassNames(
      styles.root,
      styles['size_' + size],
      styles['tone_' + tone],
      isDisabled && styles.disabled,
      className,
    );
    const contentClassName = mergeClassNames(
      styles.content,
      href && styles.contentInteractive,
      href && focusRingClassNames.focusRing,
      href && focusRingClassNames.focusRingDefault,
    );
    const sharedContent = renderTagInnerContent(elemBefore, children);
    const computedRemoveLabel = getTagRemoveLabel(removeLabel, children);

    const handleNavigateClick = React.useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClick?.(event as unknown as React.MouseEvent<HTMLElement>);
      },
      [isDisabled, onClick],
    );

    const handleRemoveClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (isDisabled) {
          return;
        }

        onRemove?.();
      },
      [isDisabled, onRemove],
    );

    if (!href && !isRemovable) {
      return (
        <span
          {...rest}
          ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
          className={mergeClassNames(rootClassName, styles.standalone)}
          data-disabled={isDisabled ? 'true' : undefined}
          data-size={size}
          data-tone={tone}
        >
          {sharedContent}
        </span>
      );
    }

    if (href && !isRemovable) {
      return (
        <a
          {...rest}
          ref={forwardedRef as React.ForwardedRef<HTMLAnchorElement>}
          className={mergeClassNames(
            rootClassName,
            styles.standalone,
            styles.contentInteractive,
            focusRingClassNames.focusRing,
            focusRingClassNames.focusRingDefault,
          )}
          href={href}
          target={target}
          rel={getTagRel(target, rel)}
          aria-describedby={ariaDescribedBy}
          aria-disabled={isDisabled ? true : undefined}
          tabIndex={isDisabled ? -1 : tabIndex}
          data-disabled={isDisabled ? 'true' : undefined}
          data-size={size}
          data-tone={tone}
          onClick={handleNavigateClick}
        >
          {sharedContent}
        </a>
      );
    }

    return (
      <span
        {...rest}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
        className={mergeClassNames(rootClassName, styles.wrapper)}
        data-disabled={isDisabled ? 'true' : undefined}
        data-size={size}
        data-tone={tone}
      >
        {href ? (
          <a
            className={contentClassName}
            href={href}
            target={target}
            rel={getTagRel(target, rel)}
            aria-describedby={ariaDescribedBy}
            aria-disabled={isDisabled ? true : undefined}
            tabIndex={isDisabled ? -1 : tabIndex}
            onClick={handleNavigateClick}
          >
            {sharedContent}
          </a>
        ) : (
          <span className={styles.content}>{sharedContent}</span>
        )}

        <button
          type="button"
          className={mergeClassNames(
            styles.removeButton,
            focusRingClassNames.focusRing,
            focusRingClassNames.focusRingDefault,
          )}
          aria-label={computedRemoveLabel}
          disabled={isDisabled}
          onClick={handleRemoveClick}
        >
          <span className={styles.removeIcon} aria-hidden="true">
            <CloseIcon size="md" />
          </span>
        </button>
      </span>
    );
  }),
);

Tag.displayName = 'Tag';
