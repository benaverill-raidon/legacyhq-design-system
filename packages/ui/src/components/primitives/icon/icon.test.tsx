import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { AddIcon } from '../../../assets/icons';
import { IconBase } from './icon-base';
import type { IconColor } from './icon.types';

const colors: IconColor[] = [
  'default',
  'subtle',
  'inverse',
  'brand',
  'success',
  'warning',
  'error',
  'information',
  'disabled',
];

afterEach(cleanup);

describe('IconBase', () => {
  it('renders with default variants', () => {
    render(
      <IconBase viewBox="0 0 24 24" testId="icon">
        <path d="M4 4h16v16H4z" />
      </IconBase>,
    );

    const root = screen.getByTestId('icon');
    const svg = root.querySelector('svg');

    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-spacing', 'none');
    expect(root).toHaveAttribute('data-color', 'default');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('renders sm size', () => {
    render(
      <IconBase viewBox="0 0 24 24" size="sm" testId="icon">
        <path d="M4 4h16v16H4z" />
      </IconBase>,
    );

    expect(screen.getByTestId('icon')).toHaveAttribute('data-size', 'sm');
  });

  it('renders md size', () => {
    render(
      <IconBase viewBox="0 0 24 24" size="md" testId="icon">
        <path d="M4 4h16v16H4z" />
      </IconBase>,
    );

    expect(screen.getByTestId('icon')).toHaveAttribute('data-size', 'md');
  });

  it('renders none spacing', () => {
    render(
      <IconBase viewBox="0 0 24 24" spacing="none" testId="icon">
        <path d="M4 4h16v16H4z" />
      </IconBase>,
    );

    expect(screen.getByTestId('icon')).toHaveAttribute('data-spacing', 'none');
  });

  it('renders spacious spacing', () => {
    render(
      <IconBase viewBox="0 0 24 24" spacing="spacious" testId="icon">
        <path d="M4 4h16v16H4z" />
      </IconBase>,
    );

    expect(screen.getByTestId('icon')).toHaveAttribute('data-spacing', 'spacious');
  });

  it.each(colors)('renders %s color', (color) => {
    render(
      <IconBase viewBox="0 0 24 24" color={color} testId="icon">
        <path d="M4 4h16v16H4z" />
      </IconBase>,
    );

    expect(screen.getByTestId('icon')).toHaveAttribute('data-color', color);
  });

  it('renders decorative mode by default', () => {
    render(<AddIcon testId="icon" />);

    expect(screen.getByTestId('icon').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders meaningful title mode', () => {
    render(<AddIcon decorative={false} title="Add item" />);

    expect(screen.getByRole('img', { name: 'Add item' })).toBeInTheDocument();
  });

  it('supports className', () => {
    render(<AddIcon className="custom-icon" testId="icon" />);

    expect(screen.getByTestId('icon')).toHaveClass('custom-icon');
  });

  it('supports testId', () => {
    render(<AddIcon testId="generated-icon" />);

    expect(screen.getByTestId('generated-icon')).toBeInTheDocument();
  });

  it('renders a generated icon component', () => {
    render(<AddIcon decorative={false} title="Add" testId="icon" />);

    const root = screen.getByTestId('icon');
    expect(root.querySelector('svg')).toHaveAttribute('viewBox');
    expect(screen.getByRole('img', { name: 'Add' })).toBeInTheDocument();
  });
});
