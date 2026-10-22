// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './atoms/button';
import buttonStyles from './atoms/button/button.module.css';
import { Checkbox, CheckboxGroup } from './atoms/checkbox';
import checkboxStyles from './atoms/checkbox/checkbox.module.css';
import { Radio, RadioGroup } from './atoms/radio';
import radioStyles from './atoms/radio/radio.module.css';
import { Slider, SliderCentered, SliderRange } from './atoms/slider';
import sliderStyles from './atoms/slider/slider.module.css';
import { Switch } from './atoms/switch';
import switchStyles from './atoms/switch/switch.module.css';
import { ToggleButton } from './atoms/toggle-button';
import toggleButtonStyles from './atoms/toggle-button/toggle-button.module.css';
import chipStyles from './molecules/chip/chip.module.css';
import { Select } from './molecules/select';
import selectStyles from './molecules/select/select.module.css';
import { RichTextArea, TextArea } from './molecules/text-area';
import richTextAreaStyles from './molecules/text-area/rich/rich-text-area.module.css';
import textAreaStyles from './molecules/text-area/text-area.module.css';
import { TextField } from './molecules/text-field';
import textFieldStyles from './molecules/text-field/text-field.module.css';
import { DatePicker } from './organisms/date-picker';
import datePickerStyles from './organisms/date-picker/date-picker.module.css';
import { DateTimePicker } from './organisms/date-time-picker';
import dateTimePickerStyles from './organisms/date-time-picker/date-time-picker.module.css';
import { TimePicker } from './organisms/time-picker';
import timePickerStyles from './organisms/time-picker/time-picker.module.css';

// A native control inside `<fieldset disabled>` is disabled, and matches `:disabled`, without its own
// `disabled` prop. Each form control must then look exactly as it does with `disabled`: every style
// that `disabled` turns on (or off) has to follow the fieldset too, not only the component's prop.
// This renders each control both ways and compares the declarations its stylesheets apply to every
// element. Hover and press are treated as always on, so the rules that switch them off when disabled
// are checked as well.

afterEach(cleanup);

type Sheet = { file: string; styles: Record<string, string> };

const sheet = (file: string, styles: Record<string, string>): Sheet => ({ file: `packages/ui/src/components/${file}`, styles });

/** Splits a selector list on its top-level commas. */
function splitSelectors(list: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Every rule in the stylesheets, with its selectors mapped to the module's class names. */
function rulesOf(sheets: Sheet[]) {
  return sheets.flatMap(({ file, styles }) => {
    const css = (readFileSync(file, 'utf8') as string).replace(/\/\*[\s\S]*?\*\//g, '');
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selectorList, body]) => {
      const declarations = body
        .split(';')
        .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
        .filter(Boolean);
      return splitSelectors(selectorList.trim())
        .filter((selector) => !selector.startsWith('@') && !selector.includes('::') && !/^(\d|from\b|to\b)/.test(selector))
        .map((selector) => ({
          selector: selector
            .replace(/:global\(\.([\w-]+)\)/g, '.__global__$1')
            .replace(/\.([a-zA-Z_][\w-]*)/g, (match, name: string) => (name.startsWith('__global__') ? `.${name.slice(10)}` : `.${styles[name]}`))
            // Hover and press always on, so the rules that turn them off for disabled are compared too.
            .replace(/:(hover|active)\b/g, ':where(*)'),
          declarations,
        }));
    });
  });
}

/** The declarations the rules apply to each element under (and including) `root`, in document order. */
function appliedStyles(root: Element, rules: ReturnType<typeof rulesOf>) {
  return [root, ...root.querySelectorAll('*')].map((element) => {
    const applied = new Set<string>();
    for (const { selector, declarations } of rules) {
      let matches = false;
      try {
        matches = element.matches(selector);
      } catch {
        // A selector jsdom can't parse (such as :autofill) is skipped, the same for both renders.
      }
      if (matches) declarations.forEach((declaration) => applied.add(declaration));
    }
    return `${element.tagName.toLowerCase()} ${[...applied].sort().join('; ')}`;
  });
}

function expectFieldsetToMatchDisabled(control: (disabled: boolean) => React.ReactElement, sheets: Sheet[]) {
  const rules = rulesOf(sheets);

  const { container: own } = render(<div>{control(true)}</div>);
  const disabled = appliedStyles(own.firstElementChild as Element, rules);
  cleanup();

  const { container: inFieldset } = render(<fieldset disabled>{control(false)}</fieldset>);
  const fieldset = inFieldset.firstElementChild as Element;
  // The same tree, with the fieldset in place of the wrapper div.
  const viaFieldset = appliedStyles(fieldset, rules).map((line, index) => (index === 0 ? disabled[0] : line));
  cleanup();

  const { container: enabled } = render(<div>{control(false)}</div>);
  const resting = appliedStyles(enabled.firstElementChild as Element, rules);

  // The disabled prop changes something (or the comparison proves nothing)...
  expect(disabled).not.toEqual(resting);
  // ...and a disabled fieldset changes exactly the same things.
  expect(viaFieldset).toEqual(disabled);
}

const noop = () => {};
const OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];
const TODAY = new Date(2026, 2, 9);

describe('Controls inside a disabled fieldset look disabled', () => {
  it.each<[string, (disabled: boolean) => React.ReactElement, Sheet[]]>([
    ['Checkbox', (disabled) => <Checkbox label="Notify the client" disabled={disabled} />, [sheet('atoms/checkbox/checkbox.module.css', checkboxStyles)]],
    ['Checkbox (checked)', (disabled) => <Checkbox label="Notify the client" defaultChecked disabled={disabled} />, [sheet('atoms/checkbox/checkbox.module.css', checkboxStyles)]],
    [
      'Checkbox Group',
      (disabled) => <CheckboxGroup label="Notify" options={OPTIONS} disabled={disabled} />,
      [sheet('atoms/checkbox/checkbox.module.css', checkboxStyles)],
    ],
    ['Radio', (disabled) => <Radio label="Hourly" name="billing" value="hourly" disabled={disabled} />, [sheet('atoms/radio/radio.module.css', radioStyles)]],
    [
      'Radio Group',
      (disabled) => <RadioGroup label="Billing" options={OPTIONS} defaultValue="open" disabled={disabled} />,
      [sheet('atoms/radio/radio.module.css', radioStyles)],
    ],
    ['Switch', (disabled) => <Switch label="Email updates" disabled={disabled} />, [sheet('atoms/switch/switch.module.css', switchStyles)]],
    ['Switch (on)', (disabled) => <Switch label="Email updates" defaultChecked disabled={disabled} />, [sheet('atoms/switch/switch.module.css', switchStyles)]],
    ['Slider', (disabled) => <Slider label="Volume" defaultValue={40} showSteps step={20} disabled={disabled} />, [sheet('atoms/slider/slider.module.css', sliderStyles)]],
    ['Slider Centered', (disabled) => <SliderCentered label="Balance" defaultValue={20} disabled={disabled} />, [sheet('atoms/slider/slider.module.css', sliderStyles)]],
    ['Slider Range', (disabled) => <SliderRange label="Budget" defaultValue={[20, 80]} disabled={disabled} />, [sheet('atoms/slider/slider.module.css', sliderStyles)]],
    ['Text Field', (disabled) => <TextField aria-label="Name" placeholder="Name" disabled={disabled} />, [sheet('molecules/text-field/text-field.module.css', textFieldStyles)]],
    [
      'Text Field (inline)',
      (disabled) => <TextField aria-label="Name" context="inline" disabled={disabled} />,
      [sheet('molecules/text-field/text-field.module.css', textFieldStyles)],
    ],
    ['Text Area', (disabled) => <TextArea aria-label="Notes" disabled={disabled} />, [sheet('molecules/text-area/text-area.module.css', textAreaStyles)]],
    [
      'Text Area (inline)',
      (disabled) => <TextArea aria-label="Notes" context="inline" disabled={disabled} />,
      [sheet('molecules/text-area/text-area.module.css', textAreaStyles)],
    ],
    [
      'Rich Text Area',
      (disabled) => <RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-label="Note" disabled={disabled} />,
      [sheet('molecules/text-area/rich/rich-text-area.module.css', richTextAreaStyles)],
    ],
    [
      'Select',
      (disabled) => <Select aria-label="Status" options={OPTIONS} value="open" onChange={noop} disabled={disabled} />,
      [
        sheet('molecules/text-field/text-field.module.css', textFieldStyles),
        sheet('molecules/select/select.module.css', selectStyles),
        sheet('molecules/chip/chip.module.css', chipStyles),
      ],
    ],
    [
      'Select (multi)',
      (disabled) => <Select aria-label="Statuses" inputType="multi" options={OPTIONS} value={['open']} onChange={noop} disabled={disabled} />,
      [
        sheet('molecules/text-field/text-field.module.css', textFieldStyles),
        sheet('molecules/select/select.module.css', selectStyles),
        sheet('molecules/chip/chip.module.css', chipStyles),
      ],
    ],
    [
      'Date Picker',
      (disabled) => <DatePicker aria-label="Opened" defaultValue={TODAY} today={TODAY} disabled={disabled} />,
      [sheet('molecules/text-field/text-field.module.css', textFieldStyles), sheet('organisms/date-picker/date-picker.module.css', datePickerStyles)],
    ],
    [
      'Time Picker',
      (disabled) => <TimePicker aria-label="Hearing time" disabled={disabled} />,
      [
        sheet('molecules/text-field/text-field.module.css', textFieldStyles),
        sheet('organisms/time-picker/time-picker.module.css', timePickerStyles),
        sheet('atoms/button/button.module.css', buttonStyles),
      ],
    ],
    [
      'Date Time Picker',
      (disabled) => <DateTimePicker aria-label="Hearing" today={TODAY} disabled={disabled} />,
      [
        sheet('molecules/text-field/text-field.module.css', textFieldStyles),
        sheet('organisms/date-picker/date-picker.module.css', datePickerStyles),
        sheet('organisms/time-picker/time-picker.module.css', timePickerStyles),
        sheet('organisms/date-time-picker/date-time-picker.module.css', dateTimePickerStyles),
      ],
    ],
    ['Button', (disabled) => <Button disabled={disabled}>Save</Button>, [sheet('atoms/button/button.module.css', buttonStyles)]],
    [
      'Button (primary)',
      (disabled) => (
        <Button prominence="primary" disabled={disabled}>
          Save
        </Button>
      ),
      [sheet('atoms/button/button.module.css', buttonStyles)],
    ],
    ['Toggle Button', (disabled) => <ToggleButton disabled={disabled}>Bold</ToggleButton>, [sheet('atoms/toggle-button/toggle-button.module.css', toggleButtonStyles)]],
    [
      'Toggle Button (selected)',
      (disabled) => (
        <ToggleButton isSelected disabled={disabled}>
          Bold
        </ToggleButton>
      ),
      [sheet('atoms/toggle-button/toggle-button.module.css', toggleButtonStyles)],
    ],
  ])('%s', (_, control, sheets) => {
    expectFieldsetToMatchDisabled(control, sheets);
  });
});

describe('Native controls inside a disabled fieldset ignore input', () => {
  it('Checkbox, Radio, and Switch stay as they are when clicked', () => {
    const onCheckboxChange = vi.fn();
    const onSwitchChange = vi.fn();
    render(
      <fieldset disabled>
        <Checkbox label="Notify the client" onCheckedChange={onCheckboxChange} />
        <Radio label="Hourly" name="billing" value="hourly" />
        <Switch label="Email updates" onCheckedChange={onSwitchChange} />
      </fieldset>,
    );

    for (const control of [
      screen.getByRole('checkbox', { name: 'Notify the client' }),
      screen.getByRole('radio', { name: 'Hourly' }),
      screen.getByRole('switch', { name: 'Email updates' }),
    ]) {
      expect(control).toBeDisabled();
      // A browser never sends a disabled control a click; the click() method is how jsdom models that.
      control.click();
      expect(control).not.toBeChecked();
    }
    screen.getByText('Notify the client').click();
    expect(onCheckboxChange).not.toHaveBeenCalled();
    expect(onSwitchChange).not.toHaveBeenCalled();
  });

  it("Button and Toggle Button don't run onClick", () => {
    const onSave = vi.fn();
    const onToggle = vi.fn();
    render(
      <fieldset disabled>
        <Button onClick={onSave}>Save</Button>
        <ToggleButton onClick={onToggle}>Bold</ToggleButton>
      </fieldset>,
    );

    for (const name of ['Save', 'Bold']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
      screen.getByRole('button', { name }).click();
    }
    expect(onSave).not.toHaveBeenCalled();
    expect(onToggle).not.toHaveBeenCalled();
  });
});
