// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from '../../atoms/button';
import { ButtonGroup } from './button-group';

const buttonGroupCss = readFileSync(
  'packages/ui/src/components/molecules/button-group/button-group.module.css',
  'utf8',
);

afterEach(cleanup);

describe('ButtonGroup', () => {
  it('renders its children in order', () => {
    render(
      <ButtonGroup>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonGroup>,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['First', 'Second', 'Third']);
  });

  it('uses horizontal orientation by default', () => {
    render(
      <ButtonGroup data-testid="group">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('supports vertical orientation', () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="group">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders no role when unlabeled', () => {
    render(
      <ButtonGroup data-testid="group">
        <Button>First</Button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).not.toHaveAttribute('role');
  });

  it('renders role=group when aria-label is present', () => {
    render(
      <ButtonGroup aria-label="Document actions">
        <Button>Save</Button>
        <Button>Cancel</Button>
      </ButtonGroup>,
    );

    expect(screen.getByRole('group', { name: 'Document actions' })).toBeInTheDocument();
  });

  it('renders role=group when aria-labelledby is present', () => {
    render(
      <div>
        <h2 id="actions-heading">Document actions</h2>
        <ButtonGroup aria-labelledby="actions-heading">
          <Button>Save</Button>
        </ButtonGroup>
      </div>,
    );

    expect(screen.getByRole('group', { name: 'Document actions' })).toBeInTheDocument();
  });

  it('keeps each child button independently focusable', () => {
    render(
      <ButtonGroup>
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>,
    );

    const [first, second] = screen.getAllByRole('button');
    first.focus();
    expect(first).toHaveFocus();
    second.focus();
    expect(second).toHaveFocus();
  });

  it('applies className', () => {
    render(
      <ButtonGroup className="custom-button-group" data-testid="group">
        <Button>First</Button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).toHaveClass('custom-button-group');
  });

  it('forwards native div attributes', () => {
    render(
      <ButtonGroup data-testid="group" title="Actions">
        <Button>First</Button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('title', 'Actions');
  });

  it('forwards the ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref}>
        <Button>First</Button>
      </ButtonGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('uses the semantic xs spacing token for the gap', () => {
    expect(buttonGroupCss).toContain('gap: var(--spacing-xs);');
  });
});
