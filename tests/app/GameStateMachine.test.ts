import { describe, expect, it, vi } from 'vitest';
import {
  GameStateMachine,
  type GameState,
  type GameStateName,
} from '../../src/app/GameStateMachine';

const createStates =
  (hooks: Partial<Record<GameStateName, Pick<GameState, 'enter' | 'exit'>>>) =>
  (name: GameStateName): GameState => ({
    name,
    ...hooks[name],
  });

describe('GameStateMachine', () => {
  it('starts in the configured initial state', () => {
    const machine = new GameStateMachine(createStates({}), 'loading');

    machine.start();

    expect(machine.currentState).toBe('loading');
  });

  it('exits the previous state before entering the next state', () => {
    const lifecycle: string[] = [];
    const machine = new GameStateMachine(
      createStates({
        boot: {
          exit: () => lifecycle.push('boot:exit'),
        },
        menu: {
          enter: () => lifecycle.push('menu:enter'),
        },
      }),
    );

    machine.start();
    machine.transitionTo('menu');

    expect(lifecycle).toEqual(['boot:exit', 'menu:enter']);
    expect(machine.currentState).toBe('menu');
  });

  it('supports transitions requested by a state context', () => {
    const machine = new GameStateMachine(
      createStates({
        boot: {
          enter: ({ transitionTo }) => transitionTo('loading'),
        },
      }),
    );

    machine.start();

    expect(machine.currentState).toBe('loading');
  });

  it('rejects conflicting deferred transitions', () => {
    const machineRef: { value?: GameStateMachine } = {};
    const machine = new GameStateMachine(
      createStates({
        boot: {
          enter: () => {
            machineRef.value?.transitionTo('menu');
            machineRef.value?.transitionTo('pause');
          },
        },
      }),
    );
    machineRef.value = machine;

    expect(() => machine.start()).toThrow('Only one deferred game state transition is allowed.');
    expect(machine.currentState).toBeUndefined();
  });

  it('restores the previous state when entering the next state fails', () => {
    const exit = vi.fn();
    const machine = new GameStateMachine(
      createStates({
        boot: {
          exit,
        },
        loading: {
          enter: () => {
            throw new Error('loading failed');
          },
        },
      }),
    );

    machine.start();

    expect(() => machine.transitionTo('loading')).toThrow('loading failed');
    expect(exit).toHaveBeenCalledOnce();
    expect(machine.currentState).toBe('boot');
  });

  it('exits and clears the active state when stopped', () => {
    const exit = vi.fn();
    const machine = new GameStateMachine(
      createStates({
        boot: {
          exit,
        },
      }),
    );

    machine.start();
    machine.stop();

    expect(exit).toHaveBeenCalledOnce();
    expect(machine.currentState).toBeUndefined();
  });
});
