import * as React from 'react';
import { Tag } from '../../../atoms/tag';
import type { EntityTypeConfig, RichTextEntity } from './rich-text-area.types';

/**
 * A small preset over the Tag atom: the inline navigational tag that a linked entity renders as. It
 * resolves the entity's tone + icon from its type config and produces a navigational Tag (an `<a>`
 * when `href` is set). Kept as a preset rather than a new component - Tag already does the color
 * (`tone`), icon (`elemBefore`), and navigation (`href`) - so an entityType just needs a tone + icon.
 */
export const DEFAULT_ENTITY_CONFIG: Record<string, EntityTypeConfig> = {
  account: { tone: 'blue' },
  person: { tone: 'blue' },
  matter: { tone: 'teal' },
  roadmap: { tone: 'purple' },
  document: { tone: 'default' },
};

export function resolveEntityConfig(
  entityType: string,
  overrides?: Record<string, EntityTypeConfig>,
): EntityTypeConfig {
  return { ...DEFAULT_ENTITY_CONFIG[entityType], ...overrides?.[entityType] };
}

export function NavTag({ entity, config }: { entity: RichTextEntity; config: EntityTypeConfig }) {
  return (
    <Tag size="sm" tone={config.tone ?? 'default'} href={entity.href} elemBefore={config.icon} tabIndex={-1}>
      {entity.label}
    </Tag>
  );
}
