export type EntityId = string & { readonly __entityId: unique symbol };

export class IdGenerator {
  private nextValue: number;

  public constructor(
    private readonly namespace: string,
    startAt = 0,
  ) {
    if (namespace.trim().length === 0) {
      throw new Error('ID namespace must not be empty.');
    }

    if (!Number.isInteger(startAt) || startAt < 0) {
      throw new Error('ID start value must be a non-negative integer.');
    }

    this.nextValue = startAt;
  }

  public next(): EntityId {
    const value = `${this.namespace}-${this.nextValue.toString(36)}` as EntityId;
    this.nextValue += 1;
    return value;
  }
}
