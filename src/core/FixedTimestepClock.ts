export type FixedTimestepStep = {
  readonly updates: number;
  readonly interpolation: number;
};

export type FixedUpdate = (deltaSeconds: number) => void;

export class FixedTimestepClock {
  private accumulator = 0;

  public constructor(
    public readonly fixedDeltaSeconds = 1 / 60,
    public readonly maximumFrameDeltaSeconds = 0.25,
  ) {
    if (!Number.isFinite(fixedDeltaSeconds) || fixedDeltaSeconds <= 0) {
      throw new Error('Fixed timestep must be a positive finite number.');
    }

    if (
      !Number.isFinite(maximumFrameDeltaSeconds) ||
      maximumFrameDeltaSeconds < fixedDeltaSeconds
    ) {
      throw new Error('Maximum frame delta must be finite and at least the fixed timestep.');
    }
  }

  public advance(elapsedSeconds: number, update: FixedUpdate): FixedTimestepStep {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      throw new Error('Elapsed time must be a non-negative finite number.');
    }

    const frameDelta = Math.min(elapsedSeconds, this.maximumFrameDeltaSeconds);
    this.accumulator += frameDelta;
    const epsilon = this.fixedDeltaSeconds * 1e-10;

    let updates = 0;
    while (this.accumulator + epsilon >= this.fixedDeltaSeconds) {
      update(this.fixedDeltaSeconds);
      this.accumulator -= this.fixedDeltaSeconds;
      if (this.accumulator < epsilon) {
        this.accumulator = 0;
      }
      updates += 1;
    }

    return {
      updates,
      interpolation: this.accumulator / this.fixedDeltaSeconds,
    };
  }

  public reset(): void {
    this.accumulator = 0;
  }
}
