import { describe, expect, it, vi } from 'vitest';
import { FixedTimestepClock } from '../../src/core/FixedTimestepClock';

describe('FixedTimestepClock', () => {
  it('runs updates only after a complete fixed interval', () => {
    const clock = new FixedTimestepClock(0.1);
    const update = vi.fn();

    const partialStep = clock.advance(0.09, update);
    expect(partialStep.updates).toBe(0);
    expect(partialStep.interpolation).toBeCloseTo(0.9);
    expect(update).not.toHaveBeenCalled();

    const completeStep = clock.advance(0.01, update);
    expect(completeStep.updates).toBe(1);
    expect(completeStep.interpolation).toBe(0);
    expect(update).toHaveBeenCalledWith(0.1);
  });

  it('runs multiple deterministic updates for a long render frame', () => {
    const clock = new FixedTimestepClock(0.1, 0.5);
    const deltas: number[] = [];

    const result = clock.advance(0.35, (deltaSeconds) => {
      deltas.push(deltaSeconds);
    });

    expect(result.updates).toBe(3);
    expect(result.interpolation).toBeCloseTo(0.5);
    expect(deltas).toEqual([0.1, 0.1, 0.1]);
  });

  it('clamps a suspended frame to the maximum frame delta', () => {
    const clock = new FixedTimestepClock(0.1, 0.25);
    const update = vi.fn();

    const result = clock.advance(10, update);

    expect(result.updates).toBe(2);
    expect(result.interpolation).toBeCloseTo(0.5);
  });

  it('resets accumulated partial time', () => {
    const clock = new FixedTimestepClock(0.1);
    const update = vi.fn();

    clock.advance(0.09, update);
    clock.reset();
    const result = clock.advance(0.01, update);

    expect(result.updates).toBe(0);
    expect(result.interpolation).toBeCloseTo(0.1);
  });

  it('rejects invalid timing configuration and elapsed values', () => {
    expect(() => new FixedTimestepClock(0)).toThrow(
      'Fixed timestep must be a positive finite number.',
    );
    expect(() => new FixedTimestepClock(0.2, 0.1)).toThrow(
      'Maximum frame delta must be finite and at least the fixed timestep.',
    );

    const clock = new FixedTimestepClock();
    expect(() => clock.advance(-1, vi.fn())).toThrow(
      'Elapsed time must be a non-negative finite number.',
    );
    expect(() => clock.advance(Number.NaN, vi.fn())).toThrow(
      'Elapsed time must be a non-negative finite number.',
    );
  });
});
