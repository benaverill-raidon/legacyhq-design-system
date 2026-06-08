import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from './Badge';

afterEach(cleanup);

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>1</Badge>);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('uses the default tone by default', () => {
    render(<Badge>1</Badge>);

    expect(screen.getByText('1')).toHaveAttribute('data-tone', 'default');
  });

  it('uses the selected tone', () => {
    render(<Badge tone="success">+1</Badge>);

    expect(screen.getByText('+1')).toHaveAttribute('data-tone', 'success');
  });

  it('supports ariaLabel', () => {
    render(<Badge ariaLabel="1 unread notification">1</Badge>);

    expect(screen.getByLabelText('1 unread notification')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Badge className="custom-badge">1</Badge>);

    expect(screen.getByText('1')).toHaveClass('custom-badge');
  });
});
