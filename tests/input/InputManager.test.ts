import { describe, expect, it } from 'vitest';
import { emptyInputCommand } from '../../src/input/InputCommands';
import { InputManager } from '../../src/input/InputManager';

describe('InputManager', () => {
  it('starts with an empty command snapshot', () => {
    const manager = new InputManager();

    expect(manager.snapshot).toEqual(emptyInputCommand());
  });

  it('normalizes movement vectors longer than one', () => {
    const manager = new InputManager();

    manager.setMove({ x: 3, y: 4 });

    expect(manager.snapshot.move.x).toBeCloseTo(0.6);
    expect(manager.snapshot.move.y).toBeCloseTo(0.8);
  });

  it('preserves look input and action state', () => {
    const manager = new InputManager();

    manager.setLook({ x: 4, y: -2 });
    manager.setAction('attack', true);
    manager.setAction('dodge', true);

    expect(manager.snapshot.look).toEqual({ x: 4, y: -2 });
    expect(manager.snapshot.attack).toBe(true);
    expect(manager.snapshot.dodge).toBe(true);
  });

  it('resets all input state', () => {
    const manager = new InputManager();

    manager.setMove({ x: 1, y: 1 });
    manager.setAction('pause', true);
    manager.reset();

    expect(manager.snapshot).toEqual(emptyInputCommand());
  });
});
