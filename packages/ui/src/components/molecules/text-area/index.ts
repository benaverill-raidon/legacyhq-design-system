export { TextArea } from './text-area';
export type { TextAreaAppearance, TextAreaProps, TextAreaResize, TextAreaSize } from './text-area.types';

// `type=rich-inline` mode - a contenteditable editor with `/` slash-command entity tagging.
export { RichTextArea, NavTag, resolveEntityConfig, DEFAULT_ENTITY_CONFIG } from './rich';
export type {
  EntityOption,
  EntitySearch,
  EntitySection,
  EntityTypeConfig,
  RichTextAreaProps,
  RichTextEntity,
  RichTextNode,
  RichTextValue,
} from './rich';
