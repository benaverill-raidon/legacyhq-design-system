// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getInsetPosition } from './slider';
import * as sliderExports from './index';
import { Slider, SliderCentered, SliderRange } from './index';
import styles from './slider.module.css';

afterEach(cleanup);

const sliderCss = readFileSync('packages/ui/src/components/atoms/slider/slider.module.css', 'utf8');

function expectInsetPosition(styleValue: string | null | undefined, multiplier: number) {
  expect(styleValue).toContain('calc(var(--slider-scale-inset)');
  expect(styleValue).toContain(`* ${multiplier}`);
}

function expectStandardSegmentGap(styleValue: string | null | undefined) {
  expect(styleValue).toContain('--slider-active-end: calc(var(--slider-value-position) - var(--slider-internal-gap))');
  expect(styleValue).toContain(
    '--slider-inactive-end-start: calc(var(--slider-value-position) + var(--slider-internal-gap))',
  );
}

describe('Slider', () => {
  it('renders a native range input', () => {
    render(<Slider aria-label="Volume" />);

    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('type', 'range');
  });

  it('renders and associates a visible label', () => {
    render(<Slider label="Volume" />);

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('supports aria-label when no visible label exists', () => {
    render(<Slider aria-label="Priority" />);

    expect(screen.getByRole('slider', { name: 'Priority' })).toBeInTheDocument();
  });

  it('uses default min max step and value', () => {
    render(<Slider aria-label="Volume" />);

    const slider = screen.getByRole('slider', { name: 'Volume' }) as HTMLInputElement;

    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveAttribute('step', '1');
    expect(slider.value).toBe('0');
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Slider aria-label="Controlled" value={25} onValueChange={() => undefined} />);

    expect(screen.getByRole('slider', { name: 'Controlled' })).toHaveValue('25');

    rerender(<Slider aria-label="Controlled" value={75} onValueChange={() => undefined} />);

    expect(screen.getByRole('slider', { name: 'Controlled' })).toHaveValue('75');
  });

  it('supports uncontrolled usage', () => {
    render(<Slider aria-label="Uncontrolled" defaultValue={50} />);

    const slider = screen.getByRole('slider', { name: 'Uncontrolled' });

    fireEvent.change(slider, { target: { value: '60' } });

    expect(slider).toHaveValue('60');
  });

  it('calls onValueChange with the next value and event', () => {
    const handleValueChange = vi.fn();

    render(<Slider aria-label="Volume" defaultValue={10} onValueChange={handleValueChange} />);

    const slider = screen.getByRole('slider', { name: 'Volume' });

    fireEvent.change(slider, { target: { value: '30' } });

    expect(handleValueChange).toHaveBeenCalledWith(30, expect.objectContaining({ target: slider }));
  });

  it('supports disabled state', () => {
    render(<Slider aria-label="Disabled" disabled />);

    expect(screen.getByRole('slider', { name: 'Disabled' })).toBeDisabled();
  });

  it('supports custom min max and step', () => {
    render(<Slider aria-label="Scale" min={10} max={90} step={10} defaultValue={40} />);

    const slider = screen.getByRole('slider', { name: 'Scale' });

    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
    expect(slider).toHaveAttribute('step', '10');
    expect(slider).toHaveValue('40');
  });

  it('applies orientation and size classes', () => {
    const { container } = render(<Slider aria-label="Vertical" orientation="vertical" size="xs" />);

    expect(container.firstChild).toHaveClass(styles.root, styles.orientation_vertical, styles.size_xs);
    expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders explicit steps when enabled', () => {
    const { container } = render(<Slider aria-label="Steps" showSteps steps={[50]} defaultValue={50} />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(1);
    expect(container.querySelectorAll(`.${styles.stepDot}`)).toHaveLength(1);
  });

  it('derives visible steps from step when the count is reasonable', () => {
    const { container } = render(<Slider aria-label="Auto steps" showSteps step={5} defaultValue={50} />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(21);
    expect(container.querySelectorAll(`.${styles.stepDot}`)).toHaveLength(21);
  });

  it('positions endpoint steps on the shared inset scale', () => {
    const { container } = render(<Slider aria-label="Endpoint steps" showSteps step={50} defaultValue={50} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expectInsetPosition(steps[0]?.getAttribute('style'), 0);
    expectInsetPosition(steps[2]?.getAttribute('style'), 1);
  });

  it('skips excessive auto steps but preserves endpoints', () => {
    const { container } = render(<Slider aria-label="Too many steps" showSteps step={1} defaultValue={50} />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(2);
  });

  it('renders min and max steps by default', () => {
    const { container } = render(<Slider aria-label="Default steps" />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(2);
  });

  it('renders segmented decorative bars around the native handle', () => {
    const { container } = render(<Slider aria-label="Segmented" defaultValue={50} />);

    expect(container.querySelector(`.${styles.inactiveTrackStart}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.activeTrack}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.inactiveTrackEnd}`)).toBeInTheDocument();
  });

  it('exposes inset endpoint position variables for alignment', () => {
    const { container, rerender } = render(<Slider aria-label="Endpoint" value={0} onValueChange={() => undefined} />);

    const control = container.querySelector(`.${styles.control}`);

    expectInsetPosition(control?.getAttribute('style'), 0);
    expect(control?.getAttribute('style')).toContain('--slider-min-position: calc(var(--slider-scale-inset)');
    expect(control?.getAttribute('style')).toContain('--slider-max-position: calc(var(--slider-scale-inset)');
    expectStandardSegmentGap(control?.getAttribute('style'));

    rerender(<Slider aria-label="Endpoint" value={100} onValueChange={() => undefined} />);

    expectInsetPosition(control?.getAttribute('style'), 1);
    expectStandardSegmentGap(control?.getAttribute('style'));
  });

  it('sets standard slider positions for 0 50 and 100 on the shared inset helper', () => {
    const { container, rerender } = render(<Slider aria-label="Scale" value={0} onValueChange={() => undefined} />);
    const control = container.querySelector(`.${styles.control}`);

    expectInsetPosition(control?.getAttribute('style'), 0);
    expectStandardSegmentGap(control?.getAttribute('style'));

    rerender(<Slider aria-label="Scale" value={50} onValueChange={() => undefined} />);

    expectInsetPosition(control?.getAttribute('style'), 0.5);
    expectStandardSegmentGap(control?.getAttribute('style'));

    rerender(<Slider aria-label="Scale" value={100} onValueChange={() => undefined} />);

    expectInsetPosition(control?.getAttribute('style'), 1);
    expectStandardSegmentGap(control?.getAttribute('style'));
  });

  it('derives handle and stop positions from the shared inset helper', () => {
    expect(getInsetPosition(0)).toBe(
      'calc(var(--slider-scale-inset) + ((100% - (var(--slider-scale-inset) * 2)) * 0))',
    );
    expect(getInsetPosition(50)).toBe(
      'calc(var(--slider-scale-inset) + ((100% - (var(--slider-scale-inset) * 2)) * 0.5))',
    );
    expect(getInsetPosition(100)).toBe(
      'calc(var(--slider-scale-inset) + ((100% - (var(--slider-scale-inset) * 2)) * 1))',
    );
  });

  it('renders value indicator when enabled', () => {
    const { container } = render(<Slider aria-label="Value" showValue defaultValue={50} />);

    expect(container.firstChild).toHaveAttribute('data-show-value', 'true');
    expect(container.querySelector(`.${styles.valueIndicator}`)).toHaveTextContent('50');
  });

  it('tracks drag state and clears it on pointer up', () => {
    const { container } = render(<Slider aria-label="Drag" defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Drag' });

    fireEvent.pointerDown(slider);
    expect(container.firstChild).toHaveAttribute('data-dragging', 'true');

    fireEvent.pointerUp(slider);
    expect(container.firstChild).not.toHaveAttribute('data-dragging');
  });

  it('clears drag state on blur', () => {
    const { container } = render(<Slider aria-label="Blur drag" defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Blur drag' });

    fireEvent.pointerDown(slider);
    expect(container.firstChild).toHaveAttribute('data-dragging', 'true');

    fireEvent.blur(slider);
    expect(container.firstChild).not.toHaveAttribute('data-dragging');
  });

  it('forwards native input props and supports custom className', () => {
    const { container } = render(
      <Slider label="Named" name="confidence" data-testid="confidence-slider" className="custom-slider" />,
    );

    const slider = screen.getByTestId('confidence-slider');

    expect(container.firstChild).toHaveClass(styles.root, 'custom-slider');
    expect(slider).toHaveAttribute('name', 'confidence');
  });
});

describe('SliderCentered', () => {
  it('renders a native range input with centered defaults', () => {
    render(<SliderCentered aria-label="Adjustment" />);

    const slider = screen.getByRole('slider', { name: 'Adjustment' }) as HTMLInputElement;

    expect(slider).toHaveAttribute('min', '-100');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider.value).toBe('0');
  });

  it('sets centered fill calculation variables', () => {
    const { container } = render(<SliderCentered aria-label="Adjustment" value={-50} onValueChange={() => undefined} />);

    const control = container.querySelector(`.${styles.control}`);

    expect(control?.getAttribute('style')).toContain('--slider-fill-start: 25%');
    expect(control?.getAttribute('style')).toContain('--slider-fill-end: 50%');
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-start: calc(var(--slider-value-position) + var(--slider-internal-gap))',
    );
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-origin-position) - var(--slider-internal-gap))',
    );
    expectInsetPosition(control?.getAttribute('style'), 0.5);
    expectInsetPosition(control?.getAttribute('style'), 0.25);
  });
});

describe('SliderRange', () => {
  it('renders two native range inputs', () => {
    render(<SliderRange label="Budget" />);

    expect(screen.getByRole('slider', { name: /Budget Minimum value/ })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /Budget Maximum value/ })).toBeInTheDocument();
  });

  it('supports default values', () => {
    render(<SliderRange label="Budget" />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('25');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('75');
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<SliderRange label="Budget" value={[10, 90]} onValueChange={() => undefined} />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('10');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('90');

    rerender(<SliderRange label="Budget" value={[20, 80]} onValueChange={() => undefined} />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('20');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('80');
  });

  it('prevents handles from crossing and calls callback with tuple', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} onValueChange={handleValueChange} />);

    const lower = screen.getByRole('slider', { name: /Minimum value/ });
    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.change(lower, { target: { value: '90' } });
    expect(handleValueChange).toHaveBeenLastCalledWith([75, 75], expect.objectContaining({ target: lower }));

    expect(lower).toHaveAttribute('min', '0');
    expect(lower).toHaveAttribute('max', '100');
    expect(upper).toHaveAttribute('min', '0');
    expect(upper).toHaveAttribute('max', '100');
  });

  it('updates only the lower value from the lower input', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} onValueChange={handleValueChange} />);

    const lower = screen.getByRole('slider', { name: /Minimum value/ });

    fireEvent.change(lower, { target: { value: '40' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([40, 75], expect.objectContaining({ target: lower }));
    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('40');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('75');
  });

  it('updates only the upper value from the upper input', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} onValueChange={handleValueChange} />);

    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.change(upper, { target: { value: '90' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([25, 90], expect.objectContaining({ target: upper }));
    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('25');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('90');
  });

  it('prevents the upper value from moving below the lower value', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} onValueChange={handleValueChange} />);

    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.change(upper, { target: { value: '10' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([25, 25], expect.objectContaining({ target: upper }));
  });

  it('supports custom handle labels without a visible label', () => {
    render(<SliderRange minLabel="Low threshold" maxLabel="High threshold" />);

    expect(screen.getByRole('slider', { name: 'Low threshold' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'High threshold' })).toBeInTheDocument();
  });

  it('supports disabled state and custom className', () => {
    const { container } = render(<SliderRange label="Budget" disabled className="custom-range-slider" />);

    expect(container.firstChild).toHaveClass(styles.rangeRoot, 'custom-range-slider');
    expect(screen.getByRole('slider', { name: /Minimum value/ })).toBeDisabled();
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toBeDisabled();
  });

  it('exposes inset position variables for both handles', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} />);

    const control = container.querySelector(`.${styles.control}`);

    expectInsetPosition(control?.getAttribute('style'), 0.25);
    expectInsetPosition(control?.getAttribute('style'), 0.75);
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-start: calc(var(--slider-lower-position) + var(--slider-internal-gap))',
    );
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-upper-position) - var(--slider-internal-gap))',
    );
  });

  it('tracks drag state for range handles and clears it on pointer up', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} />);
    const lower = screen.getByRole('slider', { name: /Minimum value/ });

    fireEvent.pointerDown(lower);
    expect(container.firstChild).toHaveAttribute('data-dragging', 'true');

    fireEvent.pointerUp(lower);
    expect(container.firstChild).not.toHaveAttribute('data-dragging');
  });

  it('brings the active range handle to the front while dragging or focused', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} />);
    const root = container.firstChild;
    const lower = screen.getByRole('slider', { name: /Minimum value/ });
    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.pointerDown(lower);
    expect(root).toHaveAttribute('data-active-handle', 'lower');

    fireEvent.pointerDown(upper);
    expect(root).toHaveAttribute('data-active-handle', 'upper');
  });
});

describe('slider exports', () => {
  it('exports the public slider family without Range', () => {
    expect(sliderExports.Slider).toBe(Slider);
    expect(sliderExports.SliderCentered).toBe(SliderCentered);
    expect(sliderExports.SliderRange).toBe(SliderRange);
    expect('Range' in sliderExports).toBe(false);
  });
});

describe('slider CSS contract', () => {
  it('uses semantic spacing 075 for scale inset and internal gap', () => {
    expect(sliderCss).toContain('--slider-scale-inset: var(--spacing-075);');
    expect(sliderCss).toContain('--slider-internal-gap: var(--spacing-075);');
  });

  it('does not use stop-layer padding or transparent handle extensions', () => {
    expect(sliderCss).not.toContain('--slider-stop-layer-padding');
    expect(sliderCss).not.toContain('--slider-handle-hit-area-extension');
    expect(sliderCss).not.toContain('linear-gradient');
  });

  it('positions stops from the shared step position variable without layer padding', () => {
    expect(sliderCss).toContain('inset-inline-start: var(--slider-step-position);');
    expect(sliderCss).toContain('inset-block-start: calc(100% - var(--slider-step-position));');
    expect(sliderCss).not.toContain('padding-inline: var(--slider-stop-layer-padding)');
    expect(sliderCss).not.toContain('padding-block: var(--slider-stop-layer-padding)');
  });

  it('keeps inactive track on the brand subtle background token', () => {
    expect(sliderCss).toContain('background: var(--color-background-brand-subtle-default);');
  });
});
