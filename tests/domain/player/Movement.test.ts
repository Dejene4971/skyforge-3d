import { describe, expect, it } from 'vitest';
import { PlayerMovement } from '../../../src/domain/player/Movement';

describe('PlayerMovement', () => {
  it('accelerates toward normalized input and updates position', () => {
    const movement = new PlayerMovement({
      maxSpeed: 4,
      acceleration: 8,
    });

    const state = movement.update({ x: 0, y: 1 }, 0.25);

    expect(state.velocity).toEqual({ x: 0, y: 2 });
    expect(state.position).toEqual({ x: 0, z: 0.5 });
    expect(state.facingRadians).toBe(0);
  });

  it('normalizes diagonal input before applying maximum speed', () => {
    const movement = new PlayerMovement({
      maxSpeed: 4,
      acceleration: 100,
    });

    const state = movement.update({ x: 1, y: 1 }, 1);

    expect(state.velocity.x).toBeCloseTo(Math.SQRT1_2 * 4);
    expect(state.velocity.y).toBeCloseTo(Math.SQRT1_2 * 4);
    expect(Math.hypot(state.velocity.x, state.velocity.y)).toBeCloseTo(4);
  });

  it('decelerates to rest when input stops', () => {
    const movement = new PlayerMovement({
      maxSpeed: 4,
      acceleration: 100,
      deceleration: 8,
    });

    movement.update({ x: 0, y: 1 }, 1);
    const state = movement.update({ x: 0, y: 0 }, 0.25);

    expect(state.velocity).toEqual({ x: 0, y: 2 });
    const stopped = movement.update({ x: 0, y: 0 }, 0.25);
    expect(stopped.velocity).toEqual({ x: 0, y: 0 });
    expect(stopped.facingRadians).toBe(0);
  });

  it('retains the last facing direction while idle', () => {
    const movement = new PlayerMovement({
      acceleration: 100,
    });

    movement.update({ x: 1, y: 0 }, 1);
    const state = movement.update({ x: 0, y: 0 }, 0);

    expect(state.facingRadians).toBeCloseTo(Math.PI / 2);
  });

  it('resets position, velocity, and facing state', () => {
    const movement = new PlayerMovement();

    movement.update({ x: 1, y: 0 }, 1);
    const state = movement.reset({
      position: { x: -2, z: 3 },
      velocity: { x: 0, y: 0 },
      facingRadians: Math.PI,
    });

    expect(state).toEqual({
      position: { x: -2, z: 3 },
      velocity: { x: 0, y: 0 },
      facingRadians: Math.PI,
    });
    expect(movement.update({ x: 0, y: 0 }, 0).position).toEqual({ x: -2, z: 3 });
  });

  it('rejects invalid configuration, state, input, and delta values', () => {
    expect(() => new PlayerMovement({ maxSpeed: 0 })).toThrow(
      'Maximum speed must be a positive finite number.',
    );
    expect(
      () =>
        new PlayerMovement(undefined, {
          position: { x: Number.NaN, z: 0 },
          velocity: { x: 0, y: 0 },
          facingRadians: 0,
        }),
    ).toThrow('Initial movement state must contain finite numbers.');

    const movement = new PlayerMovement();
    expect(() => movement.update({ x: Number.POSITIVE_INFINITY, y: 0 }, 0.1)).toThrow(
      'Movement input must contain finite numbers.',
    );
    expect(() => movement.update({ x: 0, y: 0 }, -0.1)).toThrow(
      'Movement delta time must be a non-negative finite number.',
    );
  });
});
