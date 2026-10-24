import { FixedTimestepClock, type FixedTimestepStep } from './FixedTimestepClock';

export type FrameRequest = (callback: (timestampMilliseconds: number) => void) => number;
export type FrameCancellation = (handle: number) => void;

export type FrameScheduler = {
  readonly request: FrameRequest;
  readonly cancel: FrameCancellation;
};

export type GameLoopCallbacks = {
  readonly update: (deltaSeconds: number) => void;
  readonly render: (interpolation: number) => void;
};

export class GameLoop {
  private frameHandle: number | undefined;
  private lastTimestampMilliseconds: number | undefined;
  private running = false;

  public constructor(
    private readonly scheduler: FrameScheduler,
    private readonly clock: FixedTimestepClock,
    private readonly callbacks: GameLoopCallbacks,
  ) {}

  public get isRunning(): boolean {
    return this.running;
  }

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.clock.reset();
    this.lastTimestampMilliseconds = undefined;
    this.requestNextFrame();
  }

  public stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.frameHandle !== undefined) {
      this.scheduler.cancel(this.frameHandle);
      this.frameHandle = undefined;
    }
    this.lastTimestampMilliseconds = undefined;
    this.clock.reset();
  }

  private requestNextFrame(): void {
    this.frameHandle = this.scheduler.request((timestampMilliseconds) => {
      this.frameHandle = undefined;
      this.onFrame(timestampMilliseconds);
    });
  }

  private onFrame(timestampMilliseconds: number): void {
    if (!this.running) {
      return;
    }

    const previousTimestamp = this.lastTimestampMilliseconds;
    this.lastTimestampMilliseconds = timestampMilliseconds;

    const elapsedSeconds =
      previousTimestamp === undefined
        ? 0
        : Math.max(0, (timestampMilliseconds - previousTimestamp) / 1000);

    const step = this.clock.advance(elapsedSeconds, this.callbacks.update);
    this.callbacks.render(step.interpolation);
    this.requestNextFrame();
  }
}

export const createBrowserFrameScheduler = (): FrameScheduler => ({
  request: (callback) => window.requestAnimationFrame(callback),
  cancel: (handle) => window.cancelAnimationFrame(handle),
});

export type GameLoopStep = FixedTimestepStep;
