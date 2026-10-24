import type { InputManager } from './InputManager';

export type GamepadButtonState = {
  readonly pressed: boolean;
  readonly value: number;
};

export type GamepadState = {
  readonly connected: boolean;
  readonly axes: readonly number[];
  readonly buttons: readonly GamepadButtonState[];
};

export type GamepadSource = {
  getGamepads: () => readonly (GamepadState | undefined)[];
};

export type GamepadInputOptions = {
  readonly deadzone?: number;
  readonly lookScale?: number;
};

export class GamepadInput {
  private readonly deadzone: number;
  private readonly lookScale: number;

  public constructor(
    private readonly source: GamepadSource,
    private readonly input: InputManager,
    options: GamepadInputOptions = {},
  ) {
    this.deadzone = options.deadzone ?? 0.15;
    this.lookScale = options.lookScale ?? 1;

    if (!Number.isFinite(this.deadzone) || this.deadzone < 0 || this.deadzone >= 1) {
      throw new Error('Gamepad deadzone must be finite and between zero and one.');
    }
    if (!Number.isFinite(this.lookScale) || this.lookScale <= 0) {
      throw new Error('Gamepad look scale must be a positive finite number.');
    }
  }

  public update(): boolean {
    const gamepad = this.source.getGamepads().find((candidate) => candidate?.connected);
    if (!gamepad) {
      this.input.reset();
      return false;
    }

    const moveX = applyDeadzone(gamepad.axes[0] ?? 0, this.deadzone);
    const moveY = applyDeadzone(gamepad.axes[1] ?? 0, this.deadzone);
    this.input.setMove({
      x: moveX,
      y: moveY === 0 ? 0 : -moveY,
    });
    this.input.setLook({
      x: applyDeadzone(gamepad.axes[2] ?? 0, this.deadzone) * this.lookScale,
      y: applyDeadzone(gamepad.axes[3] ?? 0, this.deadzone) * this.lookScale,
    });
    this.input.setAction('attack', isPressed(gamepad, 0));
    this.input.setAction('dodge', isPressed(gamepad, 1));
    this.input.setAction('parry', isPressed(gamepad, 2));
    this.input.setAction('interact', isPressed(gamepad, 3));
    this.input.setAction('usePotion', isPressed(gamepad, 4));
    this.input.setAction('lockOn', isPressed(gamepad, 5));
    this.input.setAction('pause', isPressed(gamepad, 9));
    return true;
  }
}

const applyDeadzone = (value: number, deadzone: number): number => {
  if (!Number.isFinite(value)) {
    throw new Error('Gamepad axis values must be finite numbers.');
  }

  const magnitude = Math.abs(value);
  if (magnitude <= deadzone) {
    return 0;
  }

  const normalizedMagnitude = (magnitude - deadzone) / (1 - deadzone);
  return Math.sign(value) * normalizedMagnitude;
};

const isPressed = (gamepad: GamepadState, index: number): boolean =>
  gamepad.buttons[index]?.pressed ?? false;
