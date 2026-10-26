import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  deleteTagAtCaret,
  indexOf,
  insertIntoSlash,
  insertPlainText,
  isPlaceholderBreak,
  isTagHost,
  rangeFromPoint,
  setCaret,
  slashOffsetAt,
  slashTextNode,
  textOffsetIn,
  toPlainText,
} from './editing';
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
        // A block's last <br> only holds an empty line open for the caret (browsers add one when a
        // line ends on a tag); it isn't a line break of its own.
        else if (el.tagName === 'BR') {
          if (!isPlaceholderBreak(el, root)) pushText('\n');
        }
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

/** Whether a `<fieldset disabled>` around the element disables it, as it would a native control. */
function isInDisabledFieldset(element: Element) {
  for (let fieldset = element.closest('fieldset'); fieldset; fieldset = fieldset.parentElement?.closest('fieldset') ?? null) {
    // A disabled fieldset doesn't disable what's in its first legend.
    if (fieldset.disabled && !fieldset.querySelector(':scope > legend')?.contains(element)) return true;
  }
  return false;
}

/**
 * A native control follows a disabled `<fieldset>` around it by itself. The editor is a div, so it
 * checks the fieldsets around it, and watches their `disabled`, to follow them the same way.
 */
function useFieldsetDisabled(ref: React.RefObject<HTMLElement | null>) {
  const [fieldsetDisabled, setFieldsetDisabled] = React.useState(false);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const check = () => setFieldsetDisabled(isInDisabledFieldset(element));
    check();
    const observer = new MutationObserver(check);
    for (let fieldset = element.closest('fieldset'); fieldset; fieldset = fieldset.parentElement?.closest('fieldset') ?? null) {
      observer.observe(fieldset, { attributes: true, attributeFilter: ['disabled'] });
    }
    return () => observer.disconnect();
  }, [ref]);
  return fieldsetDisabled;
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
  context: requestedContext,
  appearance,
  resize = 'vertical',
  invalid: requestedInvalid = false,
  disabled: requestedDisabled = false,
  required,
  placeholder,
  searchPlaceholder = 'Type to search',
  emptyMessage = 'No matches',
  rows = 3,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: RichTextAreaProps) {
  // `appearance` is the deprecated name for `context`: its subtle and inline values are inline.
  const context = requestedContext ?? (appearance && appearance !== 'default' ? 'inline' : 'default');
  const invalid = requestedInvalid || ariaInvalid === true || ariaInvalid === 'true';
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);
  // Disabled by its own prop, or by a disabled fieldset around it.
  const disabled = useFieldsetDisabled(editorRef) || requestedDisabled;
  const slashSpanRef = React.useRef<HTMLElement | null>(null);
  const hydratedRef = React.useRef(false);
  const seqRef = React.useRef(0);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [hosts, setHosts] = React.useState<HTMLElement[]>([]);
  const [open, setOpen] = React.useState(false);
  const pickerId = `${React.useId()}-picker`;
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
    value.forEach((node, index) => {
      if (node.type === 'text') {
        node.text.split('\n').forEach((part, i) => {
          if (i > 0) editor.appendChild(document.createElement('br'));
          if (part) editor.appendChild(document.createTextNode(part));
        });
      } else {
        const host = createHostEl(node.entity);
        editor.appendChild(host);
        // Room for the caret after a tag, as inserting one leaves; text that follows already gives it.
        if (value[index + 1]?.type !== 'text') editor.appendChild(document.createTextNode(' '));
        newHosts.push(host);
      }
    });
    // A value ending in a line break needs a placeholder <br> to show the empty last line.
    if (editor.lastChild?.nodeName === 'BR') editor.appendChild(document.createElement('br'));
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

  // Turn the `/query` span back into plain text (Escape / caret leaving / a space typed). A
  // selection inside the box keeps its place in the text; one anywhere else is left where it is.
  const unwrapSlashSpan = React.useCallback(() => {
    const span = slashSpanRef.current;
    slashSpanRef.current = null;
    if (!span || !editorRef.current?.contains(span)) return;
    const selection = window.getSelection();
    const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    const inside =
      range && span.contains(range.startContainer) && span.contains(range.endContainer)
        ? [textOffsetIn(span, range.startContainer, range.startOffset), textOffsetIn(span, range.endContainer, range.endOffset)]
        : null;
    const text = span.textContent ?? '';
    const parent = span.parentNode as Node;
    const index = indexOf(span);
    if (text) {
      const textNode = document.createTextNode(text);
      span.replaceWith(textNode);
      if (inside && selection) {
        const restored = document.createRange();
        restored.setStart(textNode, inside[0]);
        restored.setEnd(textNode, inside[1]);
        selection.removeAllRanges();
        selection.addRange(restored);
      }
    } else {
      span.remove();
      if (inside) setCaret(parent, index);
    }
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
      // At either end of a text node, insert beside it rather than splitting off an empty one.
      const { startContainer, startOffset } = range;
      if (startContainer.nodeType === Node.TEXT_NODE && startContainer.parentNode) {
        if (startOffset === 0) range.setStartBefore(startContainer);
        else if (startOffset === (startContainer as Text).length) range.setStartAfter(startContainer);
        range.collapse(true);
      }
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

  // After any edit, the browser's or the component's own: drop the tags that were removed, follow
  // the `/` command, and report the value.
  const syncAfterEdit = () => {
    setHosts((prev) => prev.filter((h) => editorRef.current?.contains(h)));
    const ctx = getSlashContext(editorRef.current);
    if (ctx) openOrUpdate(ctx.query, ctx.span);
    else if (slashSpanRef.current) closePicker();
    else if (open) resetPicker();
    emitChange();
  };

  const handleInput = syncAfterEdit;

  /**
   * Put pasted text at the selection, as plain text. A single word pasted into the `/` query goes
   * into the query; anything else closes the query (keeping it as text) and goes into the text.
   */
  const insertTextAtSelection = (raw: string) => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const inEditor = () => {
      const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
      return range && editor?.contains(range.startContainer) && editor.contains(range.endContainer) ? range : null;
    };
    const range = inEditor();
    if (!editor || !range) return;
    const text = toPlainText(raw);
    const span = slashSpanRef.current;
    if (span) {
      const start = slashOffsetAt(span, range.startContainer, range.startOffset);
      const end = range.collapsed ? start : slashOffsetAt(span, range.endContainer, range.endOffset);
      if (start !== null && end !== null && !/\s/.test(text)) {
        insertIntoSlash(span, start, Math.max(start, end), text);
        syncAfterEdit();
        return;
      }
      closePicker();
    }
    const target = inEditor();
    if (!target) return;
    insertPlainText(editor, target.cloneRange(), text);
    syncAfterEdit();
  };

  // Paste is always plain text: the clipboard's text/plain, never its HTML, styles, or images.
  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    if (disabled) return;
    insertTextAtSelection(event.clipboardData?.getData('text/plain') ?? '');
  };

  // A drag that starts in the editor moves its own nodes, tags included; nothing else is dragged.
  const dragSourceRef = React.useRef<Range | null>(null);

  const handleDragStart = (event: DragEvent) => {
    const editor = editorRef.current;
    dragSourceRef.current = null;
    if (disabled || !editor) {
      event.preventDefault();
      return;
    }
    let host: Node | null = event.target as Node;
    while (host && host !== editor && !isTagHost(host)) host = host.parentNode;
    let source: Range | null = null;
    if (host && host !== editor) {
      source = document.createRange();
      source.selectNode(host);
    } else {
      const selection = window.getSelection();
      const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
      if (range && !range.collapsed && editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
        source = range.cloneRange();
      }
    }
    if (!source) {
      event.preventDefault();
      return;
    }
    dragSourceRef.current = source;
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dragSourceRef.current = null;
  };

  // A drop from outside is plain text, like a paste, at the drop point.
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const editor = editorRef.current;
    const source = dragSourceRef.current;
    dragSourceRef.current = null;
    if (disabled || !editor) return;
    if (slashSpanRef.current) closePicker();
    const selection = window.getSelection();
    const target =
      rangeFromPoint(event.clientX, event.clientY) ?? (selection && selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null);
    if (!target || !editor.contains(target.startContainer)) return;
    let host: Node | null = target.startContainer;
    while (host && host !== editor && !isTagHost(host)) host = host.parentNode;
    if (host && host !== editor) target.setStartAfter(host);
    target.collapse(true);
    editor.focus({ preventScroll: true });
    if (source) {
      if (source.isPointInRange(target.startContainer, target.startOffset)) return;
      // At either end of a text node, insert beside it rather than splitting off an empty one.
      const { startContainer, startOffset } = target;
      if (startContainer.nodeType === Node.TEXT_NODE) {
        if (startOffset === 0) target.setStartBefore(startContainer);
        else if (startOffset === (startContainer as Text).length) target.setStartAfter(startContainer);
        target.collapse(true);
      }
      const fragment = source.extractContents();
      const last = fragment.lastChild;
      target.insertNode(fragment);
      if (last && last.nodeType === Node.TEXT_NODE) setCaret(last, (last as Text).length);
      else if (last?.parentNode) setCaret(last.parentNode, indexOf(last) + 1);
    } else {
      insertPlainText(editor, target, event.dataTransfer?.getData('text/plain') ?? '');
    }
    syncAfterEdit();
  };

  // The native beforeinput: what the keyboard handler and the paste and drop handlers can't see.
  const handleBeforeInput = (event: InputEvent) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (disabled) {
      event.preventDefault();
      return;
    }
    // Ctrl+B, I, U and the like: the value has no formatting, so the markup they add would be lost.
    if (event.inputType.startsWith('format')) {
      event.preventDefault();
      return;
    }
    switch (event.inputType) {
      case 'insertFromPaste':
      case 'insertFromPasteAsQuotation':
      case 'insertFromYank':
        // The paste handler normally cancels these first; this catches a paste that skipped it.
        event.preventDefault();
        insertTextAtSelection(event.dataTransfer?.getData('text/plain') ?? event.data ?? '');
        return;
      case 'insertFromDrop':
        // The drop handler inserts the text; never take the browser's own drop markup.
        event.preventDefault();
        return;
      case 'deleteContentBackward':
      case 'deleteContentForward':
        // Keyboards that send no usable keydown (mobile) still remove a tag whole.
        if (!slashSpanRef.current && deleteTagAtCaret(editor, event.inputType === 'deleteContentBackward' ? 'backward' : 'forward')) {
          event.preventDefault();
          syncAfterEdit();
        }
        return;
      case 'insertText': {
        // Typing while the query box is open goes into the box, even with the caret on its outside
        // edge (where Firefox and Safari can leave it). A caret that has left the box closes it.
        const span = slashSpanRef.current;
        const selection = window.getSelection();
        if (!span || !selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const start = slashOffsetAt(span, range.startContainer, range.startOffset);
        const end = range.collapsed ? start : slashOffsetAt(span, range.endContainer, range.endOffset);
        if (start === null || end === null) {
          closePicker();
          return;
        }
        event.preventDefault();
        insertIntoSlash(span, start, Math.max(start, end), event.data ?? '');
        syncAfterEdit();
        return;
      }
      default:
    }
  };

  // Native listeners, not React props: a tag is a portal, so React would bubble an event from it to
  // the wrapper rather than the editor, and a drag or drop on a tag would miss the editor's handlers.
  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return undefined;
    editor.addEventListener('beforeinput', handleBeforeInput);
    editor.addEventListener('paste', handlePaste);
    editor.addEventListener('dragstart', handleDragStart);
    editor.addEventListener('dragend', handleDragEnd);
    editor.addEventListener('drop', handleDrop);
    return () => {
      editor.removeEventListener('beforeinput', handleBeforeInput);
      editor.removeEventListener('paste', handlePaste);
      editor.removeEventListener('dragstart', handleDragStart);
      editor.removeEventListener('dragend', handleDragEnd);
      editor.removeEventListener('drop', handleDrop);
    };
  });

  // While the query box is open, a caret on its outside edge is moved back in, and one in front of
  // the `/` is moved after it. A caret anywhere else has left the box, which closes the picker.
  const lastSnapRef = React.useRef<{ node: Node; offset: number; time: number } | null>(null);
  const guardSlashCaret = React.useCallback(() => {
    const span = slashSpanRef.current;
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!span || !editor || !editor.contains(span) || !selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    // Focus left the editor (a click on the list, or outside, which closes it separately).
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return;
    const start = slashOffsetAt(span, range.startContainer, range.startOffset);
    if (!range.collapsed) {
      const end = slashOffsetAt(span, range.endContainer, range.endOffset);
      if (start === null || end === null) closePicker();
      return;
    }
    if (start === null) {
      closePicker();
      return;
    }
    if (range.startContainer === span.firstChild && range.startOffset === start) return;
    // Never fight a browser that moves the caret straight back to where it was corrected from.
    const now = Date.now();
    const last = lastSnapRef.current;
    if (last && last.node === range.startContainer && last.offset === range.startOffset && now - last.time < 50) return;
    lastSnapRef.current = { node: range.startContainer, offset: range.startOffset, time: now };
    setCaret(slashTextNode(span), start);
  }, [closePicker]);

  React.useEffect(() => {
    if (!open) return undefined;
    document.addEventListener('selectionchange', guardSlashCaret);
    return () => document.removeEventListener('selectionchange', guardSlashCaret);
  }, [open, guardSlashCaret]);

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
      } else if (event.key === 'Tab') {
        // Focus is leaving: close the list and let Tab move on.
        closePicker();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // Arrowing past either end of the query (over the `/`, or past its last character) leaves
        // it: close the list, keep the text, and let the caret move on. Inside, arrows move as usual.
        const span = slashSpanRef.current;
        const selection = window.getSelection();
        const at = span && selection?.anchorNode ? slashOffsetAt(span, selection.anchorNode, selection.anchorOffset) : null;
        const length = span?.textContent?.length ?? 0;
        if (at === null || (event.key === 'ArrowLeft' ? at <= 1 : at >= length)) closePicker();
      }
      return;
    }
    if ((event.key === 'Backspace' || event.key === 'Delete') && !event.metaKey && !event.nativeEvent.isComposing) {
      // Directly beside a tag, Backspace and Delete remove the whole tag.
      const editor = editorRef.current;
      if (editor && deleteTagAtCaret(editor, event.key === 'Backspace' ? 'backward' : 'forward')) {
        event.preventDefault();
        syncAfterEdit();
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
          styles[`context_${context}`],
          styles[`resize_${resize}`],
        )}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        tabIndex={disabled ? -1 : 0}
        aria-multiline="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-required={required ? true : undefined}
        aria-disabled={disabled ? true : undefined}
        aria-invalid={invalid ? true : undefined}
        // Focus stays in the editor while the list is open; aria-activedescendant points assistive
        // technology at the highlighted row.
        aria-haspopup="menu"
        aria-controls={open ? pickerId : undefined}
        aria-activedescendant={open && flatOptions[activeIndex] ? `${pickerId}-option-${activeIndex}` : undefined}
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
          id={pickerId}
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
