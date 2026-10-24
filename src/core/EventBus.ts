export type EventMap = Record<string, unknown>;

export type EventListener<T> = (event: T) => void;

export type Unsubscribe = () => void;

export class EventBus<Events extends EventMap> {
  private readonly listeners = new Map<keyof Events, Set<EventListener<unknown>>>();

  public subscribe<K extends keyof Events>(
    eventName: K,
    listener: EventListener<Events[K]>,
  ): Unsubscribe {
    const eventListeners = this.listeners.get(eventName) ?? new Set<EventListener<unknown>>();
    eventListeners.add(listener as EventListener<unknown>);
    this.listeners.set(eventName, eventListeners);

    return () => {
      eventListeners.delete(listener as EventListener<unknown>);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName);
      }
    };
  }

  public publish<K extends keyof Events>(eventName: K, event: Events[K]): void {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) {
      return;
    }

    for (const listener of [...eventListeners]) {
      listener(event);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
