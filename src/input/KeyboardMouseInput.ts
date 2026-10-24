import type { InputManager } from './InputManager';

export type KeyboardInputEvent = {
  readonly code: string;
};

export type MouseInputEvent = {
  readonly movementX: number;
  readonly movementY: number;
  readonly button: number;
};

type InputListener = {
  bivarianceHack(event: KeyboardInputEvent | MouseInputEvent): void;
}['bivarianceHack'];

export type InputEventTarget = {
  addEventListener: (type: string, listener: InputListener) => void;
  removeEventListener: (type: string, listener: InputListener) => void;
};

type ActionKey = 'attack' | 'dodge' | 'parry' | 'interact' | 'usePotion' | 'lockOn' | 'pause';

const actionKeys: ReadonlyMap<string, ActionKey> = new Map([
  ['Mouse0', 'attack'],
  ['Space', 'dodge'],
  ['ShiftLeft', 'parry'],
  ['KeyE', 'interact'],
  ['KeyQ', 'usePotion'],
  ['KeyR', 'lockOn'],
  ['Escape', 'pause'],
]);

export class KeyboardMouseInput {
  private readonly pressedKeys = new Set<string>();
  private attached = false;
  private lookX = 0;
  private lookY = 0;

  private readonly onKeyDown = (event: KeyboardInputEvent): void => {
    this.pressedKeys.add(event.code);
    const action = actionKeys.get(event.code);
    if (action) {
      this.input.setAction(action, true);
    }
    this.updateMovement();
  };

  private readonly onKeyUp = (event: KeyboardInputEvent): void => {
    this.pressedKeys.delete(event.code);
    const action = actionKeys.get(event.code);
    if (action) {
      this.input.setAction(action, false);
    }
    this.updateMovement();
  };

  private readonly onMouseMove = (event: MouseInputEvent): void => {
    this.lookX += event.movementX;
    this.lookY += event.movementY;
    this.input.setLook({ x: this.lookX, y: this.lookY });
  };

  private readonly onMouseDown = (event: MouseInputEvent): void => {
    const action = actionKeys.get(`Mouse${event.button}`);
    if (action) {
      this.input.setAction(action, true);
    }
  };

  private readonly onMouseUp = (event: MouseInputEvent): void => {
    const action = actionKeys.get(`Mouse${event.button}`);
    if (action) {
      this.input.setAction(action, false);
    }
  };

  public constructor(
    private readonly target: InputEventTarget,
    private readonly input: InputManager,
  ) {}

  public attach(): void {
    if (this.attached) {
      return;
    }

    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('mousemove', this.onMouseMove);
    this.target.addEventListener('mousedown', this.onMouseDown);
    this.target.addEventListener('mouseup', this.onMouseUp);
    this.attached = true;
  }

  public detach(): void {
    if (!this.attached) {
      return;
    }

    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('mousemove', this.onMouseMove);
    this.target.removeEventListener('mousedown', this.onMouseDown);
    this.target.removeEventListener('mouseup', this.onMouseUp);
    this.pressedKeys.clear();
    this.lookX = 0;
    this.lookY = 0;
    this.input.reset();
    this.attached = false;
  }

  private updateMovement(): void {
    const x =
      Number(this.pressedKeys.has('KeyD') || this.pressedKeys.has('ArrowRight')) -
      Number(this.pressedKeys.has('KeyA') || this.pressedKeys.has('ArrowLeft'));
    const y =
      Number(this.pressedKeys.has('KeyW') || this.pressedKeys.has('ArrowUp')) -
      Number(this.pressedKeys.has('KeyS') || this.pressedKeys.has('ArrowDown'));

    this.input.setMove({ x, y });
  }
}
