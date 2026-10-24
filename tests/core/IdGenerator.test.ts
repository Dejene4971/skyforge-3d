import { describe, expect, it } from 'vitest';
import { IdGenerator } from '../../src/core/IdGenerator';

describe('IdGenerator', () => {
  it('creates deterministic namespaced IDs', () => {
    const generator = new IdGenerator('enemy');

    expect(generator.next()).toBe('enemy-0');
    expect(generator.next()).toBe('enemy-1');
    expect(generator.next()).toBe('enemy-2');
  });

  it('supports a non-zero starting value', () => {
    const generator = new IdGenerator('loot', 35);

    expect(generator.next()).toBe('loot-z');
    expect(generator.next()).toBe('loot-10');
  });

  it('rejects invalid namespaces and starting values', () => {
    expect(() => new IdGenerator('   ')).toThrow('ID namespace must not be empty.');
    expect(() => new IdGenerator('enemy', -1)).toThrow(
      'ID start value must be a non-negative integer.',
    );
    expect(() => new IdGenerator('enemy', 1.5)).toThrow(
      'ID start value must be a non-negative integer.',
    );
  });
});
