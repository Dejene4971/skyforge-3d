import { describe, expect, it } from 'vitest';
import { GamepadInput, type GamepadSource, type GamepadState } from '../../src/input/GamepadInput';
import { InputManager } from '../../src/input/InputManager';

const createGamepad = (overrides: Partial<GamepadState> = {}): GamepadState => ({
  connected: true,
  axes: [0, 0, 0, 0],
  buttons: Array.from({ length: 10 }, () => ({ pressed: false, value: 0 })),
  ...overrides,
});

const createSource = (gamepad?: GamepadState): GamepadSource => ({
  getGamepads: () => [gamepad],
});

describe('GamepadInput', () => {
  it('maps standard sticks and buttons to neutral input commands', () => {
    const input = new InputManager();
    const buttons = Array.from({ length: 10 }, () => ({ pressed: false, value: 0 }));
    buttons[0] = { pressed: true, value: 1 };
    buttons[1] = { pressed: true, value: 1 };
    const adapter = new GamepadInput(
      createSource(
        createGamepad({
          axes: [0.5, -0.5, 0.25, -0.25],
          buttons,
        }),
      ),
      input,
      { deadzone: 0 },
    );

    expect(adapter.update()).toBe(true);
    expect(input.snapshot.move).toEqual({ x: 0.5, y: 0.5 });
    expect(input.snapshot.look).toEqual({ x: 0.25, y: -0.25 });
    expect(input.snapshot.attack).toBe(true);
    expect(input.snapshot.dodge).toBe(true);
  });

  it('filters small stick movement through the deadzone', () => {
    const input = new InputManager();
    const adapter = new GamepadInput(
      createSource(createGamepad({ axes: [0.1, -0.1, 0.2, -0.2] })),
      input,
      { deadzone: 0.2 },
    );

    adapter.update();

    expect(input.snapshot.move).toEqual({ x: 0, y: 0 });
    expect(input.snapshot.look.x).toBe(0);
    expect(input.snapshot.look.y).toBe(0);
  });

  it('clears input when no connected gamepad exists', () => {
    const input = new InputManager();
    input.setAction('attack', true);
    const adapter = new GamepadInput(createSource(), input);

    expect(adapter.update()).toBe(false);
    expect(input.snapshot.attack).toBe(false);
    expect(input.snapshot.move).toEqual({ x: 0, y: 0 });
  });

  it('rejects invalid configuration and axis values', () => {
    const input = new InputManager();

    expect(() => new GamepadInput(createSource(), input, { deadzone: 1 })).toThrow(
      'Gamepad deadzone must be finite and between zero and one.',
    );
    expect(() => new GamepadInput(createSource(), input, { lookScale: 0 })).toThrow(
      'Gamepad look scale must be a positive finite number.',
    );

    const adapter = new GamepadInput(
      createSource(createGamepad({ axes: [Number.NaN, 0, 0, 0] })),
      input,
    );
    expect(() => adapter.update()).toThrow('Gamepad axis values must be finite numbers.');
  });
});
