import * as React from 'react';
import { createPortal } from 'react-dom';
import { EntityPicker } from './entity-picker';
import { NavTag, resolveEntityConfig } from './nav-tag';
import styles from './rich-text-area.module.css';
import type { EntityOption, EntitySection, RichTextAreaProps, RichTextEntity, RichTextValue } from './rich-text-area.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

let hostKeyCounter = 0;

function entityFromEl(el: HTMLElement): RichTextEntity {
  return {
    id: el.dataset.entityId ?? '',
    entityType: el.dataset.entityType ?? '',
    label: el.dataset.entityLabel ?? '',
    href: el.dataset.entityHref || undefined,
  };
}

function createHostEl(entity: RichTextEntity): HTMLSpanElement {
  const host = document.createElement('span');
  host.setAttribute('contenteditable', 'false');
  host.className = styles.tagHost;
  host.dataset.entityId = entity.id;
  host.dataset.entityType = entity.entityType;
  host.dataset.entityLabel = entity.label;
  if (entity.href) host.dataset.entityHref = entity.href;
  host.dataset.hostKey = String((hostKeyCounter += 1));
  return host;
}

/** The inline `/query` mini-input (the Notion look) - an editable span the user types into. */
function createSlashSpan(placeholder: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = styles.slashInput;
  span.dataset.slash = 'true';
  span.dataset.placeholder = placeholder;
  span.dataset.slashEmpty = 'true';
  span.appendChild(document.createTextNode('/'));
  return span;
}

function findSlashSpan(node: Node | null, editor: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement | null);
  while (el && el !== editor) {
    if (el.dataset?.slash) return el;
    el = el.parentElement;
  }
  return null;
}

/** The active slash-command, read from the span the caret sits in - or null when there's none. */
function getSlashContext(editor: HTMLElement | null): { query: string; span: HTMLElement } | null {
  const sel = window.getSelection();
  if (!editor || !sel || !sel.isCollapsed || !sel.anchorNode) return null;
  const span = findSlashSpan(sel.anchorNode, editor);
  if (!span) return null;
  const text = span.textContent ?? '';
  if (!text.startsWith('/')) return null;
  const query = text.slice(1);
  if (/\s/.test(query)) return null;
  return { query, span };
}

function charBeforeCaret(range: Range | null): string {
  if (!range || !range.collapsed) return '';
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    if (startOffset > 0) return startContainer.textContent?.[startOffset - 1] ?? '';
    const prev = startContainer.previousSibling;
    if (!prev) return '';
    if (prev.nodeType === Node.TEXT_NODE) return prev.textContent?.slice(-1) ?? '';
    if ((prev as HTMLElement).dataset?.entityId) return ' ';
  }
  return '';
}

/** Walk the editable DOM into the flat node array - runs of text, tag hosts as entity nodes. */
function serializeDom(root: HTMLElement): RichTextValue {
  const out: RichTextValue = [];
  const pushText = (text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.type === 'text') last.text += text;
    else out.push({ type: 'text', text });
  };
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        pushText(child.textContent ?? '');
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (el.dataset.entityId) out.push({ type: 'entity', entity: entityFromEl(el) });
        else if (el.tagName === 'BR') pushText('\n');
        else {
          const isInline = window.getComputedStyle(el).display.startsWith('inline');
          if (el.previousSibling && !isInline) pushText('\n');
          walk(el);
        }
      }
    });
  };
  walk(root);
  return out.filter((n) => n.type !== 'text' || n.text.length > 0);
}

/**
 * Rich Text Area - the `type=rich-inline` mode: a contenteditable field where typing `/` inline opens
 * a grouped entity picker (options only, like Figma), the `/query` living in a small Text-Field-like
 * container, and each choice replacing it with an inline navigational tag. Value is a flat node array.
 */
export function RichTextArea({
  value,
  onChange,
  onSearch,
  recents,
  entityConfig,
  size = 'md',
  appearance = 'default',
  resize = 'vertical',
  invalid = false,
  disabled = false,
  placeholder,
  searchPlaceholder = 'Type to search',
  emptyMessage = 'No matches',
  rows = 3,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: RichTextAreaProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const slashSpanRef = React.useRef<HTMLElement | null>(null);
  const hydratedRef = React.useRef(false);
  const seqRef = React.useRef(0);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [hosts, setHosts] = React.useState<HTMLElement[]>([]);
  const [open, setOpen] = React.useState(false);
  const [sections, setSections] = React.useState<EntitySection[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pickerPos, setPickerPos] = React.useState({ left: 0, top: 0 });
  const [isEmpty, setIsEmpty] = React.useState(true);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const flatOptions = React.useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const updateEmpty = React.useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const hasText = !!editor.textContent && editor.textContent.trim().length > 0;
    const hasTag = editor.querySelectorAll('[data-entity-id]').length > 0;
    setIsEmpty(!hasText && !hasTag);
  }, []);

  const emitChange = React.useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(serializeDom(editor));
    updateEmpty();
  }, [onChange, updateEmpty]);

  // Hydrate once from `value`, then run uncontrolled (the DOM is the source of truth while editing).
  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor || hydratedRef.current) return;
    hydratedRef.current = true;
    const newHosts: HTMLElement[] = [];
    value.forEach((node) => {
      if (node.type === 'text') {
        node.text.split('\n').forEach((part, i) => {
          if (i > 0) editor.appendChild(document.createElement('br'));
          if (part) editor.appendChild(document.createTextNode(part));
        });
      } else {
        const host = createHostEl(node.entity);
        editor.appendChild(host);
        editor.appendChild(document.createTextNode(' '));
        newHosts.push(host);
      }
    });
    setHosts(newHosts);
    updateEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positionAt = React.useCallback((el: HTMLElement) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = el.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();
    setPickerPos({ left: rect.left - wrapRect.left, top: rect.bottom - wrapRect.top + 4 });
  }, []);

  const runSearch = React.useCallback(
    async (q: string) => {
      const seq = (seqRef.current += 1);
      setLoading(true);
      try {
        const result = q === '' && recents ? recents : await onSearch(q);
        if (seq === seqRef.current) {
          setSections(result);
          setActiveIndex(0);
        }
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    },
    [onSearch, recents],
  );

  const resetPicker = React.useCallback(() => {
    setOpen(false);
    setSections([]);
    setActiveIndex(0);
    slashSpanRef.current = null;
  }, []);

  // Turn the `/query` span back into plain text (Escape / caret leaving / a space typed).
  const unwrapSlashSpan = React.useCallback(() => {
    const span = slashSpanRef.current;
    slashSpanRef.current = null;
    if (!span || !editorRef.current?.contains(span)) return;
    const textNode = document.createTextNode(span.textContent ?? '');
    span.replaceWith(textNode);
    const caret = document.createRange();
    caret.setStart(textNode, textNode.length);
    caret.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(caret);
  }, []);

  const closePicker = React.useCallback(() => {
    unwrapSlashSpan();
    resetPicker();
  }, [unwrapSlashSpan, resetPicker]);

  const openOrUpdate = React.useCallback(
    (query: string, span: HTMLElement) => {
      slashSpanRef.current = span;
      if (query === '') span.setAttribute('data-slash-empty', 'true');
      else span.removeAttribute('data-slash-empty');
      positionAt(span);
      setOpen(true);
      clearTimeout(debounceRef.current);
      if (query === '') runSearch('');
      else debounceRef.current = setTimeout(() => runSearch(query), 150);
    },
    [positionAt, runSearch],
  );

  const insertOption = React.useCallback(
    (option: EntityOption) => {
      const span = slashSpanRef.current;
      if (!span) return;
      const host = createHostEl({ id: option.id, entityType: option.entityType, label: option.label, href: option.href });
      span.replaceWith(host);
      const space = document.createTextNode(' ');
      host.parentNode?.insertBefore(space, host.nextSibling);
      const after = document.createRange();
      after.setStartAfter(space);
      after.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(after);
      editorRef.current?.focus();
      setHosts((prev) => [...prev, host]);
      resetPicker();
      emitChange();
    },
    [resetPicker, emitChange],
  );

  const startSlash = React.useCallback(
    (range: Range) => {
      const span = createSlashSpan(searchPlaceholder);
      range.insertNode(span);
      const textNode = span.firstChild as Text;
      const caret = document.createRange();
      caret.setStart(textNode, 1);
      caret.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(caret);
      slashSpanRef.current = span;
      span.setAttribute('data-slash-empty', 'true');
      positionAt(span);
      setOpen(true);
      runSearch('');
      updateEmpty();
    },
    [searchPlaceholder, positionAt, runSearch, updateEmpty],
  );

  const handleInput = () => {
    setHosts((prev) => prev.filter((h) => editorRef.current?.contains(h)));
    const ctx = getSlashContext(editorRef.current);
    if (ctx) openOrUpdate(ctx.query, ctx.span);
    else if (slashSpanRef.current) closePicker();
    else if (open) resetPicker();
    emitChange();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (open) {
      // These drive the picker; every other key keeps typing into the `/query` span.
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatOptions.length - 1, 0)));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const option = flatOptions[activeIndex];
        if (option) insertOption(option);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closePicker();
      }
      return;
    }
    if (event.key === '/') {
      const sel = window.getSelection();
      const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
      if (!range || !range.collapsed) return;
      const before = charBeforeCaret(range);
      if (before === '' || /\s/.test(before)) {
        event.preventDefault();
        startSlash(range);
      }
    }
  };

  // Dismiss on a pointer press outside the field while the picker is open.
  React.useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) closePicker();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, closePicker]);

  return (
    <div ref={wrapperRef} className={mergeClassNames(styles.wrapper, className)}>
      <div
        ref={editorRef}
        className={mergeClassNames(
          styles.editor,
          styles[`size_${size}`],
          styles[`appearance_${appearance}`],
          styles[`resize_${resize}`],
        )}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        tabIndex={disabled ? -1 : 0}
        aria-multiline="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid ? true : undefined}
        data-invalid={invalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-empty={isEmpty ? 'true' : undefined}
        data-placeholder={placeholder}
        id={id}
        style={{ '--rta-rows': rows } as React.CSSProperties}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />

      {open ? (
        <EntityPicker
          position={pickerPos}
          sections={sections}
          loading={loading}
          emptyMessage={emptyMessage}
          entityConfig={entityConfig}
          activeIndex={activeIndex}
          onSelect={insertOption}
        />
      ) : null}

      {/* One NavTag portaled into each non-editable host span. `hosts` only holds attached spans -
          handleInput prunes any the user deleted - so no ref read is needed here. */}
      {hosts.map((host) =>
        createPortal(
          <NavTag entity={entityFromEl(host)} config={resolveEntityConfig(host.dataset.entityType ?? '', entityConfig)} />,
          host,
          host.dataset.hostKey,
        ),
      )}
    </div>
  );
}

RichTextArea.displayName = 'RichTextArea';
