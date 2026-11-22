import getReorderedFiles from '@/app/utils/get-reordered-files';
import { describe, expect, it } from 'vitest';

const files = [
  { id: 'a', position: 1 },
  { id: 'b', position: 2 },
  { id: 'c', position: 3 },
  { id: 'd', position: 4 },
];

const order = (items: { id: string; position: number }[]) => items.map(({ id, position }) => `${id}${position}`);

describe('getReorderedFiles', () => {
  it('moves an item forward and shifts the items in between back', () => {
    expect(order(getReorderedFiles({ id: 'a', newPosition: 3, files }))).toEqual(['b1', 'c2', 'a3', 'd4']);
  });

  it('moves an item backward and shifts the items in between forward', () => {
    expect(order(getReorderedFiles({ id: 'd', newPosition: 2, files }))).toEqual(['a1', 'd2', 'b3', 'c4']);
  });

  it('keeps the order when the position does not change', () => {
    expect(order(getReorderedFiles({ id: 'b', newPosition: 2, files }))).toEqual(['a1', 'b2', 'c3', 'd4']);
  });
});
