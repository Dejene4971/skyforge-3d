import { describe, expect, it } from 'vitest';
import {
  failure,
  flatMapResult,
  mapError,
  mapResult,
  success,
  unwrapResult,
} from '../../src/core/Result';

describe('Result', () => {
  it('creates successful and failed results', () => {
    expect(success(42)).toEqual({ ok: true, value: 42 });
    expect(failure('invalid input')).toEqual({
      ok: false,
      error: 'invalid input',
    });
  });

  it('maps successful values without changing failures', () => {
    expect(mapResult(success(3), (value) => value * 2)).toEqual({
      ok: true,
      value: 6,
    });
    expect(mapResult(failure('invalid'), (value: number) => value * 2)).toEqual({
      ok: false,
      error: 'invalid',
    });
  });

  it('maps failures without changing successful values', () => {
    expect(mapError(success(3), (error: string) => error.length)).toEqual({
      ok: true,
      value: 3,
    });
    expect(mapError(failure('invalid'), (error) => error.length)).toEqual({
      ok: false,
      error: 7,
    });
  });

  it('chains result-producing operations', () => {
    expect(flatMapResult(success(3), (value) => success(value + 1))).toEqual({
      ok: true,
      value: 4,
    });
    expect(flatMapResult(success(3), () => failure('rejected'))).toEqual({
      ok: false,
      error: 'rejected',
    });
    expect(flatMapResult(failure('invalid'), (value: number) => success(value + 1))).toEqual({
      ok: false,
      error: 'invalid',
    });
  });

  it('unwraps success and throws for failure', () => {
    expect(unwrapResult(success('ready'))).toBe('ready');
    expect(() => unwrapResult(failure('not ready'))).toThrow(
      'Cannot unwrap failed result: not ready',
    );
  });
});
