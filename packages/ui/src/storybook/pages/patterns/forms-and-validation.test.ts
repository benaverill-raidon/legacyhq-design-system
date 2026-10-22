// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { propValues } from '../../blocks/pattern-page-data';

// The facts Patterns / Forms and Validation states, checked against the component source, so the
// page can't drift from what the components do.

const COMPONENTS = 'packages/ui/src/components';
const source = (path: string): string => readFileSync(`${COMPONENTS}/${path}`, 'utf8');
const types = (path: string) => source(path);

/** The members of one exported interface, as `name?:` lines, so a prop that's missing is caught. */
const membersOf = (typesSource: string, name: string) => {
  const body = typesSource.match(new RegExp(`export interface ${name}\\b[^{]*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
  return [...body.matchAll(/^\s*'?([\w-]+)'?\??:/gm)].map(([, member]) => member);
};

describe('Forms and Validation cites', () => {
  it("Field's states, and what error and required wire onto the control", () => {
    const field = source('molecules/field/field.tsx');
    expect(propValues(types('molecules/field/field.types.ts'), 'state')).toEqual(['default', 'error', 'success']);
    expect(field).toMatch(/'aria-invalid': childProps\['aria-invalid'\] \?\? \(isError \? true : undefined\)/);
    expect(field).toMatch(/\[childProps\['aria-describedby'\] as string \| undefined, messageId\]/);
    expect(field).toMatch(/required: \(childProps\.required as boolean \| undefined\) \?\? \(required \|\| undefined\)/);
    expect(field).toMatch(/className=\{styles\.required\} aria-hidden="true"/);
    // It never sets the control's own `invalid`, so it doesn't change the control's border.
    expect(field).not.toMatch(/\binvalid:/);
  });

  it("Form: a native form, and the required legend's words", () => {
    const form = source('organisms/form/form.tsx');
    expect(form).toMatch(/<form \{\.\.\.rest\}/);
    expect(form).toMatch(/<\/span> indicates a required field/);
  });

  it('Button: type button by default, and loading that keeps the label and ignores clicks', () => {
    const button = source('atoms/button/button.tsx');
    expect(button).toMatch(/type = 'button'/);
    expect(button).toMatch(/aria-busy=\{isLoading \? true : undefined\}/);
    expect(button).toMatch(/if \(disabled \|\| isLoading\) \{\s*event\.preventDefault\(\);/);
    expect(button).toMatch(/<span className=\{styles\.content\}>\{children\}<\/span>/);
  });

  it('Section Message takes a ref and any other attribute, such as tabIndex, and is a polite live region', () => {
    const message = source('organisms/section-message/section-message.tsx');
    expect(message).toMatch(/React\.forwardRef<HTMLDivElement, SectionMessageProps>/);
    expect(message).toMatch(/\{\.\.\.rest\}\s*ref=\{forwardedRef\}/);
    expect(message).toMatch(/role = 'status'/);
  });

  it('Radio Group and Checkbox Group: legend, description, errorMessage, and invalid', () => {
    for (const path of ['atoms/radio/radio.types.ts', 'atoms/checkbox/checkbox.types.ts']) {
      const group = membersOf(types(path), path.includes('radio') ? 'RadioGroupProps' : 'CheckboxGroupProps');
      expect(group).toEqual(expect.arrayContaining(['label', 'description', 'errorMessage', 'invalid', 'required']));
    }
    expect(source('atoms/radio/radio-group.tsx')).toMatch(/<fieldset/);
    expect(source('atoms/checkbox/checkbox-group.tsx')).toMatch(/<fieldset/);
  });

  it("a required Checkbox Group adds hidden text but doesn't make a checkbox required", () => {
    const group = source('atoms/checkbox/checkbox-group.tsx');
    expect(group).toMatch(/requiredLabel = 'required'/);
    expect(group).toMatch(/required=\{option\.required\}/);
    expect(group).not.toMatch(/required=\{required\}/);
  });

  it('a single Checkbox has invalid but no message of its own', () => {
    const checkbox = membersOf(types('atoms/checkbox/checkbox.types.ts'), 'CheckboxProps');
    expect(checkbox).toContain('invalid');
    expect(checkbox).not.toEqual(expect.arrayContaining(['message']));
    expect(checkbox).not.toContain('errorMessage');
  });

  it("Rich Text Area isn't a native control: no name, and required only as aria-required", () => {
    const editor = source('molecules/text-area/rich/rich-text-area.tsx');
    expect(editor).toMatch(/contentEditable=\{!disabled\}/);
    expect(editor).toMatch(/aria-required=\{required \? true : undefined\}/);
    expect(editor).not.toMatch(/\sname=\{/);
  });

  it('Date Picker and Time Picker add a hidden required input, so the browser checks them', () => {
    for (const path of ['organisms/date-picker/date-picker.tsx', 'organisms/time-picker/time-picker.tsx']) {
      expect(source(path)).toMatch(/\{required \? \(\s*\/\/ A read-only input is never validated/);
    }
  });

  it('Date Time Picker marks both halves invalid', () => {
    expect(types('organisms/date-time-picker/date-time-picker.types.ts')).toMatch(/Shows the error border on both fields and sets `aria-invalid` on both inputs\./);
  });

  it('Switch, Slider, and Inline Edit have no invalid state', () => {
    expect(membersOf(types('atoms/switch/switch.types.ts'), 'SwitchProps')).not.toContain('invalid');
    expect(membersOf(types('atoms/switch/switch.types.ts'), 'SwitchProps')).toContain('isLoading');
    expect(types('atoms/slider/slider.types.ts')).not.toMatch(/invalid\??:/);
    expect(types('molecules/inline-edit/inline-edit.types.ts')).not.toMatch(/invalid\??:/);
  });

  it('Inline Edit confirms the draft when focus leaves it', () => {
    expect(types('molecules/inline-edit/inline-edit.types.ts')).toMatch(/or focus leaving Inline Edit/);
  });
});
