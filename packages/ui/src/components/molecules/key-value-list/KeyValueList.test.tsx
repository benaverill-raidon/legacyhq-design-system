import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { KeyValuePair } from '../key-value-pair';
import { KeyValueList } from './key-value-list';
import styles from './key-value-list.module.css';

afterEach(cleanup);

describe('KeyValueList', () => {
  it('renders a <dl> element', () => {
    const { container } = render(
      <KeyValueList>
        <KeyValuePair label="Name" value="Jane" />
      </KeyValueList>,
    );

    expect(container.firstElementChild?.tagName).toBe('DL');
  });

  it('renders multiple KeyValuePair children', () => {
    render(
      <KeyValueList>
        <KeyValuePair label="Name" value="Jane" />
        <KeyValuePair label="Email" value="jane@example.com" />
      </KeyValueList>,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('applies className to the root', () => {
    const { container } = render(
      <KeyValueList className="custom-list">
        <KeyValuePair label="K" value="V" />
      </KeyValueList>,
    );

    expect(container.firstElementChild).toHaveClass('custom-list');
    expect(container.firstElementChild).toHaveClass(styles.root);
  });
});
