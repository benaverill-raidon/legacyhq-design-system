import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Card } from './card';

afterEach(cleanup);

describe('Card', () => {
  it('renders an unrestricted slot without introducing interactive semantics', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref} id="summary" className="consumer" aria-labelledby="summary-title" data-testid="card">
      <h2 id="summary-title">Summary</h2>
      <p>Any content can go here.</p>
    </Card>);
    const card = screen.getByTestId('card');
    expect(ref.current).toBe(card);
    expect(card).toHaveAttribute('id', 'summary');
    expect(card).toHaveClass('consumer');
    expect(card).toHaveAttribute('aria-labelledby', 'summary-title');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveAttribute('data-surface', 'raised');
    expect(card).toHaveAttribute('data-border', 'true');
    expect(screen.getByRole('heading', { name: 'Summary' }).parentElement).toBe(card);
    expect(screen.getByText('Any content can go here.').parentElement).toBe(card);
  });

  it('preserves child input state and native form behavior when surface and border change', () => {
    const submit = vi.fn((event) => event.preventDefault());
    const content = <form onSubmit={submit}>
      <label htmlFor="card-name">Name</label>
      <input id="card-name" defaultValue="Planning" />
      <button type="submit">Save</button>
    </form>;
    const { rerender } = render(<Card>{content}</Card>);
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Review' } });
    rerender(<Card surface="none" border={false} borderRadius="xxl">{content}</Card>);
    expect(screen.getByLabelText('Name')).toBe(input);
    expect(input).toHaveValue('Review');
    expect(input.closest('[data-surface]')).toHaveAttribute('data-border', 'false');
    expect(input.closest('[data-surface]')).not.toHaveAttribute('border');
    rerender(<Card surface="none" border>{content}</Card>);
    expect(screen.getByLabelText('Name')).toBe(input);
    expect(input).toHaveValue('Review');
    expect(input.closest('[data-surface]')).toHaveAttribute('data-border', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
