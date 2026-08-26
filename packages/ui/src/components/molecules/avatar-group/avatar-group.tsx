import * as React from 'react';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { DropdownMenu } from '../../organisms/dropdown-menu';
import type { MenuSection } from '../../organisms/menu';
import styles from './avatar-group.module.css';
import type { AvatarGroupItem, AvatarGroupProps } from './avatar-group.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function defaultOverflowLabel(hiddenCount: number) {
  return `+${hiddenCount}`;
}

function overflowItemLabel(avatar: AvatarGroupItem) {
  return avatar.name ?? avatar.alt ?? 'Unnamed';
}

function warnForZeroVisibleAvatars(maxVisible: number | undefined) {
  if (import.meta.env?.PROD) {
    return;
  }

  if (typeof maxVisible === 'number' && maxVisible < 1) {
    console.warn(
      'AvatarGroup: maxVisible must be at least 1 - a "+N" trigger with no visible avatars ' +
        "doesn't give enough context that the group represents people. Clamped to 1.",
    );
  }
}

export const AvatarGroup = React.memo(function AvatarGroup({
  avatars,
  maxVisible,
  size = 'lg',
  overflowLabel = defaultOverflowLabel,
  overflowMenuAriaLabel,
  onOverflowAvatarSelect,
  id,
  className,
}: AvatarGroupProps) {
  const [overflowOpen, setOverflowOpen] = React.useState(false);

  React.useEffect(() => {
    warnForZeroVisibleAvatars(maxVisible);
  }, [maxVisible]);

  const hasOverflow = typeof maxVisible === 'number' && avatars.length > maxVisible;
  // A "+N" trigger with zero visible avatars alongside it reads as an anonymous badge, not a group
  // of people - always keep at least one real avatar visible when there's anything to show at all.
  const effectiveMaxVisible = hasOverflow ? Math.max(1, maxVisible as number) : maxVisible;
  const visibleAvatars = hasOverflow ? avatars.slice(0, effectiveMaxVisible) : avatars;
  const hiddenAvatars = hasOverflow ? avatars.slice(effectiveMaxVisible) : [];

  const visibleAvatarElements = visibleAvatars.map(({ id: avatarId, ...avatarProps }) => (
    <span key={avatarId} className={styles.avatarRing}>
      <Avatar {...avatarProps} size={size} />
    </span>
  ));

  let overflowTrigger: React.ReactNode = null;
  if (hasOverflow) {
    const overflowSections: MenuSection[] = [
      {
        id: 'overflow',
        items: hiddenAvatars.map((avatar) => ({
          id: avatar.id,
          label: overflowItemLabel(avatar),
          leadingElement: (
            <Avatar
              src={avatar.src}
              name={avatar.name}
              alt={avatar.alt}
              entityType={avatar.entityType}
              size="xs"
              decorative
            />
          ),
          disabled: avatar.isDisabled,
          onSelect: (event) => onOverflowAvatarSelect?.(avatar, event),
        })),
      },
    ];

    overflowTrigger = (
      <DropdownMenu
        key="avatar-group-overflow"
        aria-label={overflowMenuAriaLabel ?? `${hiddenAvatars.length} more people`}
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
        showSearch={false}
        sections={overflowSections}
      >
        <Button
          size={size}
          appearance="subtle"
          className={styles.overflowTrigger}
          onClick={() => setOverflowOpen((current) => !current)}
        >
          {overflowLabel(hiddenAvatars.length)}
        </Button>
      </DropdownMenu>
    );
  }

  return (
    <div id={id} className={mergeClassNames(styles.root, styles['size_' + size], className)}>
      {visibleAvatarElements}
      {overflowTrigger}
    </div>
  );
});

AvatarGroup.displayName = 'AvatarGroup';
