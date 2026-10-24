import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus';

type TestEvents = {
  damage: {
    amount: number;
  };
  defeated: {
    entityId: string;
  };
};

describe('EventBus', () => {
  it('publishes typed events to listeners in subscription order', () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];

    bus.subscribe('damage', (event) => {
      received.push(`first:${event.amount}`);
    });
    bus.subscribe('damage', (event) => {
      received.push(`second:${event.amount}`);
    });

    bus.publish('damage', { amount: 12 });

    expect(received).toEqual(['first:12', 'second:12']);
  });

  it('returns an unsubscribe function that removes one listener', () => {
    const bus = new EventBus<TestEvents>();
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    const unsubscribe = bus.subscribe('defeated', firstListener);

    bus.subscribe('defeated', secondListener);
    unsubscribe();
    bus.publish('defeated', { entityId: 'enemy-0' });

    expect(firstListener).not.toHaveBeenCalled();
    expect(secondListener).toHaveBeenCalledOnce();
  });

  it('does not invoke a listener added during the current publication', () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];

    bus.subscribe('damage', () => {
      received.push('first');
      bus.subscribe('damage', () => {
        received.push('added');
      });
    });

    bus.publish('damage', { amount: 1 });
    expect(received).toEqual(['first']);

    bus.publish('damage', { amount: 2 });
    expect(received).toEqual(['first', 'first', 'added']);
  });

  it('clears all listeners', () => {
    const bus = new EventBus<TestEvents>();
    const listener = vi.fn();

    bus.subscribe('damage', listener);
    bus.subscribe('defeated', listener);
    bus.clear();
    bus.publish('damage', { amount: 1 });
    bus.publish('defeated', { entityId: 'enemy-0' });

    expect(listener).not.toHaveBeenCalled();
  });
});
