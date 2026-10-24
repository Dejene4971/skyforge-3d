import { describe, expect, it } from 'vitest';
import { InputManager } from '../../src/input/InputManager';
import {
  KeyboardMouseInput,
  type KeyboardInputEvent,
  type MouseInputEvent,
} from '../../src/input/KeyboardMouseInput';

type InputEvent = KeyboardInputEvent | MouseInputEvent;
type Listener = (event: InputEvent) => void;

class TestEventTarget {
  private readonly listeners = new Map<string, Set<Listener>>();

  public addEventListener(type: string, listener: Listener): void {
    const listeners = this.listeners.get(type) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  public removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  public dispatch(type: string, event: InputEvent): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  public listenerCount(type: string): number {
    return this.listeners.get(type)?.size ?? 0;
  }
}

describe('KeyboardMouseInput', () => {
  it('maps keyboard movement and actions', () => {
    const target = new TestEventTarget();
    const input = new InputManager();
    const adapter = new KeyboardMouseInput(target, input);

    adapter.attach();
    target.dispatch('keydown', { code: 'KeyW' });
    target.dispatch('keydown', { code: 'KeyD' });
    target.dispatch('keydown', { code: 'Space' });

    expect(input.snapshot.move.x).toBeCloseTo(Math.SQRT1_2);
    expect(input.snapshot.move.y).toBeCloseTo(Math.SQRT1_2);
    expect(input.snapshot.dodge).toBe(true);
  });

  it('maps mouse look and primary attack', () => {
    const target = new TestEventTarget();
    const input = new InputManager();
    const adapter = new KeyboardMouseInput(target, input);

    adapter.attach();
    target.dispatch('mousemove', { movementX: 5, movementY: -3, button: 0 });
    target.dispatch('mousedown', { movementX: 0, movementY: 0, button: 0 });

    expect(input.snapshot.look).toEqual({ x: 5, y: -3 });
    expect(input.snapshot.attack).toBe(true);
  });

  it('cleans up listeners and input state on detach', () => {
    const target = new TestEventTarget();
    const input = new InputManager();
    const adapter = new KeyboardMouseInput(target, input);

    adapter.attach();
    adapter.attach();
    target.dispatch('keydown', { code: 'KeyW' });
    adapter.detach();

    expect(input.snapshot.move).toEqual({ x: 0, y: 0 });
    expect(target.listenerCount('keydown')).toBe(0);
    expect(target.listenerCount('mousemove')).toBe(0);
  });
});
