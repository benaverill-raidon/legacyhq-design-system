import * as React from 'react';
import { Menu } from '../../../organisms/menu';
import type { MenuItem, MenuSection } from '../../../organisms/menu';
import { Avatar } from '../../../atoms/avatar';
import { AvatarGroup } from '../../avatar-group';
import { IconTile } from '../../icon-tile';
import type { IconTileTone } from '../../icon-tile';
import { resolveEntityConfig } from './nav-tag';
import styles from './rich-text-area.module.css';
import type { EntityOption, EntitySection, EntityTypeConfig } from './rich-text-area.types';

interface EntityPickerProps {
  /** Caret-relative position within the editor wrapper. */
  position: { left: number; top: number };
  sections: EntitySection[];
  loading: boolean;
  emptyMessage: React.ReactNode;
  entityConfig?: Record<string, EntityTypeConfig>;
  /** Flat index of the keyboard-active row across all sections (focus stays in the editor). */
  activeIndex: number;
  onSelect: (option: EntityOption) => void;
}

function toTileTone(tone: EntityTypeConfig['tone']): IconTileTone {
  return tone && tone !== 'default' ? (tone as IconTileTone) : 'gray';
}

/** A person/family row leads with an Avatar or Avatar Group (rendered inline so it hugs its width). */
function isAvatarLeading(node: React.ReactNode): boolean {
  return React.isValidElement(node) && (node.type === Avatar || node.type === AvatarGroup);
}

function toMenuItem(option: EntityOption, entityConfig?: Record<string, EntityTypeConfig>): MenuItem {
  if (isAvatarLeading(option.leadingElement)) {
    // Avatar hugs its width, left-aligned, no description - matching Figma's Families and People list.
    return {
      id: option.id,
      label: (
        <span className={styles.avatarRow}>
          {option.leadingElement}
          <span>{option.label}</span>
        </span>
      ),
      onSelect: () => undefined,
    };
  }
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    leadingElement: option.leadingElement ?? resolveEntityConfig(option.entityType, entityConfig).icon,
    onSelect: () => undefined,
  };
}

/**
 * The floating slash-command picker - options only, exactly like Figma: no search field (the query
 * is typed inline in the editor). Section headings use a 16px IconTile; results are the Menu's own
 * rows (scrolling past a capped height). Focus stays in the editor, so the keyboard-active row is
 * marked with a class (the aria-activedescendant pattern) rather than by moving focus.
 */
export function EntityPicker({ position, sections, loading, emptyMessage, entityConfig, activeIndex, onSelect }: EntityPickerProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  const menuSections: MenuSection[] = sections.map((section) => {
    const config = resolveEntityConfig(section.entityType, entityConfig);
    return {
      id: section.id,
      heading: section.heading,
      headingLeadingElement: config.icon ? (
        <IconTile size="xxs" shape="square" tone={toTileTone(config.tone)} decorative>
          {config.icon}
        </IconTile>
      ) : undefined,
      items: section.items.map((option) => ({ ...toMenuItem(option, entityConfig), onSelect: () => onSelect(option) })),
    };
  });

  // Mark the active row without moving focus out of the editor.
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const items = panel.querySelectorAll<HTMLElement>('[role^="menuitem"]');
    items.forEach((el, index) => {
      if (index === activeIndex) {
        el.classList.add('rta-active');
        // Guarded: jsdom has no scrollIntoView, and marking the active row matters
        // more than scrolling to it - an unguarded call throws in consumer tests.
        el.scrollIntoView?.({ block: 'nearest' });
      } else {
        el.classList.remove('rta-active');
      }
    });
  }, [activeIndex, sections, loading]);

  return (
    <div ref={panelRef} className={styles.picker} style={{ left: position.left, top: position.top }}>
      <Menu
        sections={menuSections}
        showSearch={false}
        size="md"
        fullWidth
        maxHeight={280}
        loading={loading}
        emptyMessage={emptyMessage}
        aria-label="Entities to link"
      />
    </div>
  );
}
