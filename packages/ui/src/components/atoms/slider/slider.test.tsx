// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getVisualPosition } from './slider';
import * as sliderExports from './index';
import { Slider, SliderCentered, SliderRange } from './index';
import styles from './slider.module.css';

afterEach(cleanup);

const sliderCss = readFileSync('packages/ui/src/components/atoms/slider/slider.module.css', 'utf8');
const tokensCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');
const lightCss = readFileSync('packages/ui/src/tokens/generated/light.css', 'utf8');
const darkCss = readFileSync('packages/ui/src/tokens/generated/dark.css', 'utf8');

function expectInsetPosition(styleValue: string | null | undefined, multiplier: number) {
  expect(styleValue).toContain('calc(var(--slider-value-scale-inset)');
  expect(styleValue).toContain(`* ${multiplier}`);
}

function expectStandardSegmentGap(styleValue: string | null | undefined) {
  // The gap around the handle must hold at every value, including the 0/100 extremes - the
  // track fill should never run under the handle just because it's sitting at an endpoint.
  expect(styleValue).toContain(
    '--slider-active-end: calc(var(--slider-value-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))',
  );
  expect(styleValue).toContain(
    '--slider-inactive-end-start: calc(var(--slider-value-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))',
  );
}

function getCustomProperty(element: Element | null | undefined, property: string) {
  return element instanceof HTMLElement ? element.style.getPropertyValue(property).trim() : '';
}

function expectSharedCoordinateLayer(container: HTMLElement) {
  const control = container.querySelector(`.${styles.control}`);
  const track = container.querySelector(`.${styles.track}`);
  const steps = container.querySelector(`.${styles.steps}`);
  const handles = container.querySelector(`.${styles.handles}`);
  const valueIndicators = container.querySelector(`.${styles.valueIndicators}`);

  expect(control).toBeInTheDocument();
  expect(track?.parentElement).toBe(control);
  expect(steps?.parentElement).toBe(control);
  expect(handles?.parentElement).toBe(control);
  expect(valueIndicators?.parentElement).toBe(control);
  expect(track?.contains(steps)).toBe(false);
  expect(track?.contains(handles)).toBe(false);
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

  it('uses the step-aware value scale for vertical sliders', () => {
    const { container } = render(<Slider aria-label="Vertical steps" orientation="vertical" defaultValue={50} />);

    const control = container.querySelector(`.${styles.control}`);
    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(control).toHaveAttribute('data-has-steps', 'true');
    expect(getCustomProperty(steps[0], '--slider-step-position')).toBe(getVisualPosition(0));
    expect(sliderCss).toContain('inset-block-start: calc(100% - var(--slider-step-position));');
  });

  it('renders explicit steps when enabled', () => {
    const { container } = render(<Slider aria-label="Steps" showSteps steps={[50]} defaultValue={50} />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(3);
    expect(container.querySelectorAll(`.${styles.stepDot}`)).toHaveLength(3);
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

  it('preserves endpoint steps around explicit numeric steps', () => {
    const { container } = render(<Slider aria-label="Explicit steps" showSteps steps={[50]} defaultValue={50} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps).toHaveLength(3);
    expectInsetPosition(steps[0]?.getAttribute('style'), 0);
    expectInsetPosition(steps[1]?.getAttribute('style'), 0.5);
    expectInsetPosition(steps[2]?.getAttribute('style'), 1);
  });
  it('adds placement metadata to endpoint and middle steps', () => {
    const { container } = render(<Slider aria-label="Step placement" showSteps steps={[50]} defaultValue={50} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps[0]).toHaveAttribute('data-placement', 'start');
    expect(steps[1]).toHaveAttribute('data-placement', 'middle');
    expect(steps[2]).toHaveAttribute('data-placement', 'end');
  });

  it('aligns the handle exactly with the endpoint track-stop dot at value 0 and 100', () => {
    const { container, rerender } = render(
      <Slider aria-label="Endpoint alignment" showSteps step={50} value={0} onValueChange={() => undefined} />,
    );
    let control = container.querySelector(`.${styles.control}`);
    let steps = container.querySelectorAll(`.${styles.step}`);

    expect(getCustomProperty(steps[0], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-value-position'),
    );

    rerender(
      <Slider aria-label="Endpoint alignment" showSteps step={50} value={100} onValueChange={() => undefined} />,
    );
    control = container.querySelector(`.${styles.control}`);
    steps = container.querySelectorAll(`.${styles.step}`);

    expect(getCustomProperty(steps[2], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-value-position'),
    );
  });

  it('uses the exact value-position string for matching explicit steps', () => {
    const { container } = render(<Slider aria-label="Matching step" showSteps steps={[50]} defaultValue={50} />);

    const control = container.querySelector(`.${styles.control}`);
    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(getCustomProperty(steps[1], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-value-position'),
    );
  });

  it('marks the control as step-aligned when endpoint steps are rendered', () => {
    const { container } = render(<Slider aria-label="Step-aligned scale" defaultValue={50} />);

    const control = container.querySelector(`.${styles.control}`);

    expect(control).toHaveAttribute('data-has-steps', 'true');
  });

  it('skips excessive autu steps but preserves endpoints', () => {
    const { container } = render(<Slider aria-label="Too many steps" showSteps step={1} defaultValue={50} />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(2);
  });
  it('marks auto-generated endpoint steps with endpoint placement', () => {
    const { container } = render(<Slider aria-label="Auto placement" showSteps step={50} defaultValue={50} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps[0]).toHaveAttribute('data-placement', 'start');
    expect(steps[1]).toHaveAttribute('data-placement', 'middle');
    expect(steps[2]).toHaveAttribute('data-placement', 'end');
  });

  it('renders min and max steps by default', () => {
    const { container } = render(<Slider aria-label="Default steps" />);

    expect(container.querySelectorAll(`.${styles.step}`)).toHaveLength(2);
  });
  it('uses middle placement for a single rendered step', () => {
    const { container } = render(<Slider aria-label="Single step" min={0} max={0} defaultValue={0} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps).toHaveLength(1);
    expect(steps[0]).toHaveAttribute('data-placement', 'middle');
  });

  it('renders segmented decorative bars and a private visual handle', () => {
    const { container } = render(<Slider aria-label="Segmented" defaultValue={50} />);

    expect(container.querySelector(`.${styles.inactiveTrackStart}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.activeTrack}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.inactiveTrackEnd}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.handleSingle}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.handleSingle} .${styles.handleVisual}`)).toBeInTheDocument();
  });

  it('renders track steps handles and value indicators as siblings in the shared coordinate layer', () => {
    const { container } = render(<Slider aria-label="Layered steps" defaultValue={50} showSteps />);

    expectSharedCoordinateLayer(container);
  });

  it('keeps the track fill flush with the control edges, distinct from the inset value scale', () => {
    // The track's own fill spans the true 0%/100% of the control (matching Figma, where the
    // track pill is flush with the frame edges) - only the handle, dots, and origin use the
    // inset value-scale. --slider-min-position/--slider-max-position feed exclusively into the
    // track segment boundaries, so they stay at the raw edges rather than the inset scale. The
    // handle-adjacent boundary still keeps its gap even at 0/100, so the fill never runs under
    // the handle itself.
    const { container, rerender } = render(<Slider aria-label="Endpoint" value={0} onValueChange={() => undefined} />);

    const control = container.querySelector(`.${styles.control}`);

    expectInsetPosition(control?.getAttribute('style'), 0);
    expect(control?.getAttribute('style')).toContain('--slider-min-position: 0%');
    expect(control?.getAttribute('style')).toContain('--slider-max-position: 100%');
    expect(control?.getAttribute('style')).toContain(
      '--slider-inactive-end-start: calc(var(--slider-value-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))',
    );

    rerender(<Slider aria-label="Endpoint" value={100} onValueChange={() => undefined} />);

    expectInsetPosition(control?.getAttribute('style'), 1);
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-value-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))',
    );
  });

  it('keeps a gap between the track fill and the handle at the value extremes, matching mid-track spacing', () => {
    // Regression guard: the track's own fill boundary must apply the same handle-gap math at
    // 0 and 100 as it does everywhere else - previously it snapped flush to the raw edge at the
    // extremes, so the fill ran under/past the handle instead of leaving a gap around it.
    const { container, rerender } = render(<Slider aria-label="Gap at extremes" value={0} onValueChange={() => undefined} />);
    const control = container.querySelector(`.${styles.control}`);

    expectStandardSegmentGap(control?.getAttribute('style'));

    rerender(<Slider aria-label="Gap at extremes" value={50} onValueChange={() => undefined} />);
    expectStandardSegmentGap(control?.getAttribute('style'));

    rerender(<Slider aria-label="Gap at extremes" value={100} onValueChange={() => undefined} />);
    expectStandardSegmentGap(control?.getAttribute('style'));
  });

  it('never lets the track-fill boundary vary with size or step count - it always spans the raw 0%-100% control', () => {
    // A regression guard for a real bug: the track segment's outer boundary must stay pinned to
    // the control's true edges regardless of --slider-stop-container-size (which varies by size
    // and drives the *inset* handle/dot scale) - otherwise the visible track fill and the
    // track-stop container disagree about where the edge of the slider actually is.
    for (const size of ['xs', 'sm', 'md'] as const) {
      const { container, unmount } = render(
        <Slider aria-label={`Track edges ${size}`} size={size} showSteps value={100} onValueChange={() => undefined} />,
      );
      const control = container.querySelector(`.${styles.control}`);

      expect(control?.getAttribute('style')).toContain('--slider-min-position: 0%');
      expect(control?.getAttribute('style')).toContain('--slider-max-position: 100%');
      unmount();
    }
  });

  it('positions the visual handle on the same inset variable as value-based visuals', () => {
    const { container } = render(<Slider aria-label="Visual handle" value={50} onValueChange={() => undefined} />);

    const control = container.querySelector(`.${styles.control}`);
    const handle = container.querySelector(`.${styles.handleSingle}`);
    const handleVisual = container.querySelector(`.${styles.handleVisual}`);

    expect(handle).toBeInTheDocument();
    expect(handleVisual?.parentElement).toBe(handle);
    expect(control?.getAttribute('style')).toContain('--slider-value-position: calc(var(--slider-value-scale-inset)');
    expect(sliderCss).toContain('inset-inline-start: var(--slider-value-position);');
    expect(sliderCss).toContain('inset-block-start: calc(100% - var(--slider-value-position));');
  });

  it('does not emit raw percent step positioning styles', () => {
    const { container } = render(<Slider aria-label="Nu raw step percent" showSteps steps={[50]} defaultValue={50} />);

    container.querySelectorAll(`.${styles.step}`).forEach((step) => {
      expect(step.getAttribute('style')).toContain('--slider-step-position: calc(var(--slider-value-scale-inset)');
      expect(step.getAttribute('style')).not.toContain('--slider-step-percent');
    });
  });

  it('sets standard slider positions for 0 50 and 100 on the shared inset helper', () => {
    const { container, rerender } = render(<Slider aria-label="Scale" value={0} onValueChange={() => undefined} />);
    const control = container.querySelector(`.${styles.control}`);

    expectInsetPosition(control?.getAttribute('style'), 0);
    expect(control?.getAttribute('style')).toContain(
      '--slider-inactive-end-start: calc(var(--slider-value-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))',
    );

    rerender(<Slider aria-label="Scale" value={50} onValueChange={() => undefined} />);

    expectInsetPosition(control?.getAttribute('style'), 0.5);
    expect(control?.getAttribute('style')).toContain('--slider-active-end: calc(var(--slider-value-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))');
    expect(control?.getAttribute('style')).toContain('--slider-inactive-end-start: calc(var(--slider-value-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))');

    rerender(<Slider aria-label="Scale" value={100} onValueChange={() => undefined} />);

    expectInsetPosition(control?.getAttribute('style'), 1);
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-value-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))',
    );
  });

  it('derives handle and step positions from the shared visual position helper', () => {
    expect(getVisualPosition(0)).toBe(
      'calc(var(--slider-value-scale-inset) + ((100% - var(--slider-value-scale-inset) - var(--slider-value-scale-inset)) * 0))',
    );
    expect(getVisualPosition(50)).toBe(
      'calc(var(--slider-value-scale-inset) + ((100% - var(--slider-value-scale-inset) - var(--slider-value-scale-inset)) * 0.5))',
    );
    expect(getVisualPosition(100)).toBe(
      'calc(var(--slider-value-scale-inset) + ((100% - var(--slider-value-scale-inset) - var(--slider-value-scale-inset)) * 1))',
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

  it('clears drag state un blur', () => {
    const { container } = render(<Slider aria-label="Blur drag" defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Blur drag' });

    fireEvent.pointerDown(slider);
    expect(container.firstChild).toHaveAttribute('data-dragging', 'true');

    fireEvent.blur(slider);
    expect(container.firstChild).not.toHaveAttribute('data-dragging');
  });

  it('marks focus that follows our own pointerdown handling so the CSS can suppress its ring', () => {
    const { container } = render(<Slider aria-label="Pointer focus" defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Pointer focus' });
    const control = container.querySelector(`.${styles.control}`) as HTMLElement;

    // The real handler already calls input.focus() synchronously as part of pointerdown handling
    // (the input has pointer-events: none, so it never receives - and re-dispatches - focus on
    // its own); firing pointerdown is enough to reach that focus, without also firing a separate
    // focus event that a real click sequence would never produce.
    fireEvent.pointerDown(control);

    expect(slider).toHaveAttribute('data-pointer-focus', 'true');
  });

  it('clears the pointer-focus marker once the user starts using the keyboard', () => {
    const { container } = render(<Slider aria-label="Keyboard resumes ring" defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Keyboard resumes ring' });
    const control = container.querySelector(`.${styles.control}`) as HTMLElement;

    fireEvent.pointerDown(control);
    expect(slider).toHaveAttribute('data-pointer-focus', 'true');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    expect(slider).not.toHaveAttribute('data-pointer-focus');
  });

  it('does not set data-pointer-focus for plain keyboard focus (no preceding pointerdown)', () => {
    render(<Slider aria-label="Tab focus" defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Tab focus' });

    fireEvent.focus(slider);

    expect(slider).not.toHaveAttribute('data-pointer-focus');
  });

  it('forwards native input prups and supports custom className', () => {
    const { container } = render(
      <Slider label="Named" name="cunfidence" data-testid="cunfidence-slider" className="custom-slider" />,
    );

    const slider = screen.getByTestId('cunfidence-slider');

    expect(container.firstChild).toHaveClass(styles.root, 'custom-slider');
    expect(slider).toHaveAttribute('name', 'cunfidence');
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

  it('sets centered fill calculatiun variables', () => {
    const { container } = render(<SliderCentered aria-label="Adjustment" value={-50} onValueChange={() => undefined} />);

    const control = container.querySelector(`.${styles.control}`);

    expect(control?.getAttribute('style')).toContain('--slider-fill-start: 25%');
    expect(control?.getAttribute('style')).toContain('--slider-fill-end: 50%');
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-start: calc(var(--slider-value-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))',
    );
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-origin-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))',
    );
    expectInsetPosition(control?.getAttribute('style'), 0.5);
    expectInsetPosition(control?.getAttribute('style'), 0.25);
  });

  it('positions centered slider explicit steps with the shared helper', () => {
    const { container } = render(
      <SliderCentered aria-label="Centered steps" showSteps steps={[-50, 0, 50]} defaultValue={0} />,
    );

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps).toHaveLength(5);
    expectInsetPosition(steps[0]?.getAttribute('style'), 0);
    expectInsetPosition(steps[2]?.getAttribute('style'), 0.5);
    expectInsetPosition(steps[4]?.getAttribute('style'), 1);
  });

  it('renders centered slider steps in the shared coordinate layer', () => {
    const { container } = render(<SliderCentered aria-label="Centered layers" defaultValue={0} showSteps />);

    expectSharedCoordinateLayer(container);
  });

  it('uses the exact origin-position string for the centered zero step', () => {
    const { container } = render(
      <SliderCentered aria-label="Centered matching step" showSteps steps={[-50, 0, 50]} defaultValue={0} />,
    );

    const control = container.querySelector(`.${styles.control}`);
    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(getCustomProperty(steps[2], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-origin-position'),
    );
    expect(getCustomProperty(steps[2], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-value-position'),
    );
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

  it('emits sorted values when handles swap by default', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} onValueChange={handleValueChange} />);

    const lower = screen.getByRole('slider', { name: /Minimum value/ });
    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.change(lower, { target: { value: '90' } });
    expect(handleValueChange).toHaveBeenLastCalledWith([75, 90], expect.objectContaining({ target: lower }));

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

  it('emits sorted values when the upper handle crosses the lower handle', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} onValueChange={handleValueChange} />);

    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.change(upper, { target: { value: '10' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([10, 25], expect.objectContaining({ target: upper }));
  });

  it('respects custom minDistance for lower and upper handles', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} minDistance={10} disableSwap onValueChange={handleValueChange} />);

    const lower = screen.getByRole('slider', { name: /Minimum value/ });
    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.change(lower, { target: { value: '72' } });
    expect(handleValueChange).toHaveBeenLastCalledWith([65, 75], expect.objectContaining({ target: lower }));

    fireEvent.change(upper, { target: { value: '30' } });
    expect(handleValueChange).toHaveBeenLastCalledWith([65, 75], expect.objectContaining({ target: upper }));
  });

  it('allows thumb swapping when disableSwap is false', () => {
    const handleValueChange = vi.fn();

    render(
      <SliderRange
        label="Budget"
        defaultValue={[25, 75]}
        disableSwap={false}
        minDistance={0}
        onValueChange={handleValueChange}
      />,
    );

    const lower = screen.getByRole('slider', { name: /Minimum value/ });

    fireEvent.change(lower, { target: { value: '90' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([75, 90], expect.objectContaining({ target: lower }));
  });

  it('allows handles to overlap when minDistance is zero', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[50, 50]} minDistance={0} showValue />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('50');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('50');
    expect(container.firstChild).toHaveAttribute('data-overlapping', 'true');

    const control = container.querySelector(`.${styles.control}`);
    expect(getCustomProperty(control, '--slider-lower-position')).toBe(
      getCustomProperty(control, '--slider-upper-position'),
    );
    expect(getCustomProperty(control, '--slider-fill-start')).toBe('50%');
    expect(getCustomProperty(control, '--slider-fill-end')).toBe('50%');
  });

  it('moves to an overlapped value when minDistance is zero', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[40, 50]} minDistance={0} onValueChange={handleValueChange} />);

    const lower = screen.getByRole('slider', { name: /Minimum value/ });

    fireEvent.change(lower, { target: { value: '50' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([50, 50], expect.objectContaining({ target: lower }));
  });

  it('normalizes reversed values before rendering', () => {
    const { rerender } = render(<SliderRange label="Budget" value={[80, 20]} onValueChange={() => undefined} />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('20');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('80');

    rerender(<SliderRange label="Budget" value={[90, 30]} minDistance={10} onValueChange={() => undefined} />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('30');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('90');
  });

  it('enforces minimum distance for invalid initial overlap', () => {
    render(<SliderRange label="Budget" defaultValue={[50, 50]} minDistance={10} />);

    expect(screen.getByRole('slider', { name: /Minimum value/ })).toHaveValue('50');
    expect(screen.getByRole('slider', { name: /Maximum value/ })).toHaveValue('60');
  });

  it('keeps the active handle above the other handle when values overlap', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[50, 50]} minDistance={0} />);
    const root = container.firstChild;
    const lower = screen.getByRole('slider', { name: /Minimum value/ });
    const upper = screen.getByRole('slider', { name: /Maximum value/ });

    fireEvent.focus(lower);
    expect(root).toHaveAttribute('data-active-handle', 'lower');
    expect(root).toHaveAttribute('data-overlapping', 'true');

    fireEvent.focus(upper);
    expect(root).toHaveAttribute('data-active-handle', 'upper');
  });

  it('prevents handle swapping when disableSwap is true', () => {
    const handleValueChange = vi.fn();

    render(<SliderRange label="Budget" defaultValue={[25, 75]} minDistance={10} disableSwap onValueChange={handleValueChange} />);

    const lower = screen.getByRole('slider', { name: /Minimum value/ });

    fireEvent.change(lower, { target: { value: '90' } });

    expect(handleValueChange).toHaveBeenLastCalledWith([65, 75], expect.objectContaining({ target: lower }));
  });
  it('supports custom handle labels without a visible label', () => {
    render(<SliderRange minLabel="Luw threshold" maxLabel="High threshold" />);

    expect(screen.getByRole('slider', { name: 'Luw threshold' })).toBeInTheDocument();
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

    expect(container.querySelector(`.${styles.handleLower}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.handleUpper}`)).toBeInTheDocument();
    expectInsetPosition(control?.getAttribute('style'), 0.25);
    expectInsetPosition(control?.getAttribute('style'), 0.75);
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-start: calc(var(--slider-lower-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))',
    );
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-upper-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))',
    );
  });

  it('keeps the range track fill flush with the control edges, distinct from the inset value scale', () => {
    const { container } = render(<SliderRange label="Budget" size="md" showSteps defaultValue={[0, 100]} />);

    const control = container.querySelector(`.${styles.control}`);

    expect(control?.getAttribute('style')).toContain('--slider-min-position: 0%');
    expect(control?.getAttribute('style')).toContain('--slider-max-position: 100%');
  });

  it('keeps a gap between the track fill and each handle when the range spans the full 0-100 extremes', () => {
    // Regression guard: same bug as the single Slider - the lower/upper handle-adjacent
    // boundaries must keep the handle gap even when a handle sits exactly at 0 or 100.
    const { container } = render(<SliderRange label="Budget" defaultValue={[0, 100]} />);

    const control = container.querySelector(`.${styles.control}`);

    expect(control?.getAttribute('style')).toContain(
      '--slider-active-start: calc(var(--slider-lower-position) + var(--component-slider-handle-half-width) + var(--slider-internal-gap))',
    );
    expect(control?.getAttribute('style')).toContain(
      '--slider-active-end: calc(var(--slider-upper-position) - var(--component-slider-handle-half-width) - var(--slider-internal-gap))',
    );
  });

  it('positions range explicit steps with the shared helper', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps steps={[25, 75]} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps).toHaveLength(4);
    expectInsetPosition(steps[0]?.getAttribute('style'), 0);
    expectInsetPosition(steps[1]?.getAttribute('style'), 0.25);
    expectInsetPosition(steps[2]?.getAttribute('style'), 0.75);
    expectInsetPosition(steps[3]?.getAttribute('style'), 1);
  });
  it('adds endpoint placement metadata to range steps', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps steps={[25, 75]} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps[0]).toHaveAttribute('data-placement', 'start');
    expect(steps[1]).toHaveAttribute('data-placement', 'middle');
    expect(steps[2]).toHaveAttribute('data-placement', 'middle');
    expect(steps[3]).toHaveAttribute('data-placement', 'end');
  });
  it('marks range controls as step-aligned when endpoint steps are rendered', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} />);

    const control = container.querySelector(`.${styles.control}`);

    expect(control).toHaveAttribute('data-has-steps', 'true');
  });

  it('renders range slider steps and handles in the shared coordinate layer', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps />);

    expectSharedCoordinateLayer(container);
  });

  it('uses the exact lower and upper handle position strings for matching range steps', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps steps={[25, 75]} />);

    const control = container.querySelector(`.${styles.control}`);
    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(getCustomProperty(steps[1], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-lower-position'),
    );
    expect(getCustomProperty(steps[2], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-upper-position'),
    );
  });

  it('positions range explicit steps with the shared helper', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps steps={[25, 75]} />);

    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(steps).toHaveLength(4);
    expectInsetPosition(steps[0]?.getAttribute('style'), 0);
    expectInsetPosition(steps[1]?.getAttribute('style'), 0.25);
    expectInsetPosition(steps[2]?.getAttribute('style'), 0.75);
    expectInsetPosition(steps[3]?.getAttribute('style'), 1);
  });

  it('renders range slider steps and handles in the shared coordinate layer', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps />);

    expectSharedCoordinateLayer(container);
  });

  it('uses the exact lower and upper handle position strings for matching range steps', () => {
    const { container } = render(<SliderRange label="Budget" defaultValue={[25, 75]} showSteps steps={[25, 75]} />);

    const control = container.querySelector(`.${styles.control}`);
    const steps = container.querySelectorAll(`.${styles.step}`);

    expect(getCustomProperty(steps[1], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-lower-position'),
    );
    expect(getCustomProperty(steps[2], '--slider-step-position')).toBe(
      getCustomProperty(control, '--slider-upper-position'),
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

    fireEvent.focus(lower);
    expect(root).toHaveAttribute('data-active-handle', 'lower');

    fireEvent.focus(upper);
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
  it('maps generated border radius xl and xxl to the latest semantic values', () => {
    expect(tokensCss).toContain('--border-radius-12: 12px;');
    expect(tokensCss).toContain('--border-radius-16: 16px;');
    expect(tokensCss).toContain('--border-radius-xl: var(--border-radius-12);');
    expect(tokensCss).toContain('--border-radius-xxl: var(--border-radius-16);');
  });

  it('uses a single uniform corner radius on every track segment, matching Figma', () => {
    // Figma gives every track segment corner - including the ones where two segments meet
    // mid-track - the same 8px radius (border-radius-lg), not a full-round pill at the touching
    // ends and a smaller radius at the inner joints.
    expect(tokensCss).not.toContain('--component-slider-track-radius:');
    expect(tokensCss).not.toContain('--component-slider-track-adjacent-radius:');
    expect(sliderCss).not.toContain('border-start-start-radius:');
    expect(sliderCss).not.toContain('data-active-touches');
    expect(sliderCss).not.toContain('data-inactive-end-full');
    const radiusCount = (sliderCss.match(/border-radius: var\(--border-radius-lg\);/g) || []).length;
    expect(radiusCount).toBeGreaterThanOrEqual(3);
  });

  it('shares one endpoint-inset variable for slider positioning, correctly overridden when steps are present', () => {
    // `--slider-value-scale-inset` is the single source of truth for where 0%/100% sit (handle,
    // track-stops, and the track segments' outer edges all read it) - it must be overridden
    // directly by the has-steps selector, not through a separate `--slider-endpoint-inset` alias
    // that inheritance never actually threads back through.
    expect(sliderCss).toContain('--slider-value-scale-inset: var(--component-slider-handle-half-width);');
    expect(sliderCss).not.toContain('--slider-endpoint-inset');
    expect(sliderCss).not.toContain('--slider-track-span');
    expect(sliderCss).toContain(".control[data-has-steps='true']");
    expect(sliderCss).toContain('--slider-value-scale-inset: calc(var(--slider-stop-container-size) / 2);');
    expect(sliderCss).toContain('inset: 0;');
    expect(sliderCss).toContain('inline-size: 100%;');
    expect(sliderCss).toContain('block-size: 100%;');
    expect(sliderCss).toContain('--slider-internal-gap: var(--spacing-sm);');
    expect(sliderCss).toContain('cursor: pointer;');
    expect(sliderCss).toContain('touch-action: none;');
    expect(sliderCss).toContain('pointer-events: none;');
    expect(sliderCss).toContain('pointer-events: auto;');
    expect(sliderCss).not.toContain(".root:not([data-disabled='true']):active .control,");
    expect(sliderCss).not.toContain('--slider-current-handle-width: var(--slider-handle-width-press);');
    expect(sliderCss).not.toContain('slider-track-boundary-inset');
  });

  it('uses a fixed stop container size independent of track thickness, matching the handle geometry', () => {
    // The stop container (and the handle) stay a constant 16px regardless of size - only the
    // track thickness scales with size. Aliasing the stop container to track height (the
    // previous implementation) breaks handle/track-stop alignment at every size except xs, where
    // track-height-xs happens to equal 16px by coincidence.
    expect(tokensCss).toContain('--component-slider-stop-container-size-xs: var(--measurement-16);');
    expect(tokensCss).toContain('--component-slider-stop-container-size-sm: var(--measurement-16);');
    expect(tokensCss).toContain('--component-slider-stop-container-size-md: var(--measurement-16);');
    expect(sliderCss).toContain('--slider-stop-container-size: var(--component-slider-stop-container-size-md);');
    expect(sliderCss).toContain('--slider-stop-container-size: var(--component-slider-stop-container-size-xs);');
    expect(sliderCss).toContain('--slider-stop-container-size: var(--component-slider-stop-container-size-sm);');
    expect(sliderCss).toContain('inline-size: var(--slider-stop-container-size);');
    expect(sliderCss).toContain('block-size: var(--slider-stop-container-size);');
    expect(sliderCss).toContain('inline-size: var(--size-marker-xs);');
    expect(sliderCss).toContain('block-size: var(--size-marker-xs);');
    expect(tokensCss).toContain('--size-marker-xs: var(--measurement-4);');
  });

  it('maps slider track and stop colors to chart semantic tokens', () => {
    expect(sliderCss).toContain('--slider-track-active-color: var(--color-data-viz-sequence-prussian-900);');
    expect(sliderCss).toContain('--slider-track-inactive-color: var(--color-data-viz-sequence-prussian-300);');
    expect(sliderCss).toContain('--slider-step-color: var(--color-content-brand-primary-default);');
    expect(sliderCss).not.toContain('--slider-step-outline-color');
    expect(sliderCss).not.toContain('box-shadow: 0 0 0 var(--border-width-sm)');
  });

  it('generates the expanded chart semantic token groups', () => {
    expect(lightCss).toContain('--color-data-viz-sequence-green-900: var(--color-green-solid-900);');
    expect(darkCss).toContain('--color-data-viz-sequence-green-900: var(--color-green-solid-200);');
    expect(lightCss).toContain('--color-data-viz-catergory-subtler-prussian: var(--color-brand-prussian-solid-300);');
    expect(lightCss).toContain('--color-data-viz-catergory-subtle-prussian: var(--color-brand-prussian-solid-500);');
    expect(lightCss).toContain('--color-data-viz-catergory-bolder-prussian: var(--color-brand-prussian-solid-700);');
    expect(darkCss).toContain('--color-data-viz-catergory-subtler-prussian: var(--color-brand-prussian-solid-800);');
    expect(darkCss).toContain('--color-data-viz-catergory-subtle-prussian: var(--color-brand-prussian-solid-700);');
    expect(darkCss).toContain('--color-data-viz-catergory-bolder-prussian: var(--color-brand-prussian-solid-500);');
  });

  it('uses the focus ring token mapping on the private visual handle', () => {
    expect(sliderCss).toContain('outline: var(--border-width-md) solid var(--color-border-focus);');
    expect(sliderCss).toContain('outline-offset: var(--spacing-xs);');
    expect(sliderCss).not.toContain('outline-offset: var(--spacing-none);');
  });

  it('suppresses the handle focus ring for pointer-originated focus, on every handle selector', () => {
    expect(sliderCss).toContain(".control:has(.singleInput:focus-visible:not([data-pointer-focus='true'])) .handleSingle");
    expect(sliderCss).toContain(".control:has(.rangeInputLower:focus-visible:not([data-pointer-focus='true'])) .handleLower");
    expect(sliderCss).toContain(".control:has(.rangeInputUpper:focus-visible:not([data-pointer-focus='true'])) .handleUpper");
  });

  it('swaps a track-stop dot to the subtle brand color when it sits on the active fill, like Progress Bar', () => {
    expect(sliderCss).toContain('--slider-step-color: var(--color-content-brand-primary-default);');
    expect(sliderCss).toContain("[data-active='true'] .stepDot");
    expect(sliderCss).toContain('background: var(--color-content-brand-primary-subtle);');
    // The active-color override must out-specificity the disabled-state stepDot rule so a
    // disabled, active-region dot never renders the brand color instead of the disabled one.
    expect(sliderCss).toContain(".root:not([data-disabled='true']) .step[data-active='true'] .stepDot");
  });

  it('marks track-stop dots within the active fill so the CSS can contrast them, at both endpoints and in between', () => {
    const { container } = render(
      <Slider aria-label="Active dots" showSteps step={25} defaultValue={60} />,
    );
    const steps = container.querySelectorAll(`.${styles.step}`);

    // 0/25/50 fall at or before the 60% fill; 75/100 fall after it.
    expect(Array.from(steps).map((step) => step.getAttribute('data-active'))).toEqual([
      'true',
      'true',
      'true',
      null,
      null,
    ]);
  });

  it('makes the native thumb transparent and uses a custom visual handle', () => {
    expect(sliderCss).toContain('background: transparent;');
    expect(sliderCss).toContain('.handle {');
    expect(sliderCss).toContain('.handleVisual {');
    expect(sliderCss).toContain('background: var(--slider-handle-visual-color);');
    expect(sliderCss).toContain('--slider-handle-visual-color: var(--color-background-brand-primary-bold-default);');
    expect(sliderCss).toContain('--slider-handle-visual-color: var(--color-background-brand-primary-bold-hover);');
    expect(sliderCss).toContain('--slider-handle-visual-color: var(--color-background-brand-primary-bold-press);');
    expect(sliderCss).toContain('inset-inline-start: var(--slider-lower-position);');
    expect(sliderCss).toContain('inset-inline-start: var(--slider-upper-position);');
  });

  it('shrinks only the inner visual handle to the pressed width without changing positioning rules', () => {
    expect(sliderCss).toContain('--slider-handle-width-press: var(--measurement-2);');
    expect(sliderCss).toContain('.root:not(.rangeRoot):not([data-disabled=\'true\']):active .handleSingle .handleVisual');
    expect(sliderCss).toContain(
      '.rangeRoot[data-active-handle=\'lower\']:not([data-disabled=\'true\']):active .handleLower .handleVisual',
    );
    expect(sliderCss).toContain('.control:has(.singleInput[data-preview-state=\'press\']) .handleSingle .handleVisual');
    expect(sliderCss).toContain('.rangeRoot[data-active-handle=\'lower\']:not([data-disabled=\'true\']):hover .handleLower');
    expect(sliderCss).toContain('.rangeRoot[data-active-handle=\'upper\']:not([data-disabled=\'true\']):hover .handleUpper');
    expect(sliderCss).toContain('.control:has(.rangeInputLower[data-preview-state=\'hover\']) .handleLower');
    expect(sliderCss).toContain('.control:has(.rangeInputUpper[data-preview-state=\'hover\']) .handleUpper');
    expect(sliderCss).not.toContain('.root:not([data-disabled=\'true\']):hover .handle,');
    expect(sliderCss).not.toContain('.root:not([data-disabled=\'true\']):active .handle,');
    expect(sliderCss).toContain('.handle {');
    expect(sliderCss).toContain('inline-size: var(--slider-handle-width);');
    expect(sliderCss).toContain('transform: translate(-50%, -50%);');
    expect(sliderCss).toContain('transform: translate(-50%, -50%) rotate(90deg);');
  });

  it('centers every step container on its position regardless of placement, so endpoint dots sit exactly under the handle', () => {
    // Edge-anchoring the start/end step containers (translate(0, -50%) / translate(-100%, -50%))
    // shifted the visible dot inside them by half the container width away from the shared
    // position variable the handle uses - the handle and endpoint track-stop must resolve to the
    // exact same center point at value 0 and 100, so every placement uses the same centered
    // transform.
    expect(sliderCss).not.toContain("data-placement='start']");
    expect(sliderCss).not.toContain("data-placement='end']");
    expect(sliderCss).toContain('.step {');
    expect(sliderCss).toContain('transform: translate(-50%, -50%);');
  });

  it('does not use stop-layer padding or transparent handle extensions', () => {
    expect(sliderCss).not.toContain('--slider-stop-layer-padding');
    expect(sliderCss).not.toContain('--slider-handle-hit-area-extension');
    expect(sliderCss).not.toContain('linear-gradient');
  });

  it('positions stops from the shared step position variable without layer padding', () => {
    expect(sliderCss).toContain('inset-inline-start: var(--slider-step-position);');
    expect(sliderCss).toContain('inset-block-start: calc(100% - var(--slider-step-position));');
    expect(sliderCss).toContain('.steps,');
    expect(sliderCss).toContain('.handles,');
    expect(sliderCss).toContain('.valueIndicators');
    expect(sliderCss).toContain('inset: 0;');
    expect(sliderCss).not.toContain('padding-inline: var(--slider-stop-layer-padding)');
    expect(sliderCss).not.toContain('padding-block: var(--slider-stop-layer-padding)');
  });
});
