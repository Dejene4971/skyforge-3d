import { describe, expect, it, vi } from 'vitest';
import { FixedTimestepClock } from '../../src/core/FixedTimestepClock';
import { GameLoop, type FrameScheduler } from '../../src/core/GameLoop';

type PendingFrame = {
  readonly handle: number;
  readonly callback: (timestampMilliseconds: number) => void;
};

const createTestScheduler = (): {
  scheduler: FrameScheduler;
  frames: PendingFrame[];
  cancelledHandles: number[];
  runNextFrame: (timestampMilliseconds: number) => void;
} => {
  const frames: PendingFrame[] = [];
  const cancelledHandles: number[] = [];
  let nextHandle = 1;

  return {
    scheduler: {
      request: (callback) => {
        const handle = nextHandle;
        nextHandle += 1;
        frames.push({ handle, callback });
        return handle;
      },
      cancel: (handle) => {
        cancelledHandles.push(handle);
        const frameIndex = frames.findIndex((frame) => frame.handle === handle);
        if (frameIndex >= 0) {
          frames.splice(frameIndex, 1);
        }
      },
    },
    frames,
    cancelledHandles,
    runNextFrame: (timestampMilliseconds) => {
      const frame = frames.shift();
      if (!frame) {
        throw new Error('No frame is pending.');
      }
      frame.callback(timestampMilliseconds);
    },
  };
};

describe('GameLoop', () => {
  it('starts once and renders after fixed updates', () => {
    const testScheduler = createTestScheduler();
    const updates: number[] = [];
    const renders: number[] = [];
    const loop = new GameLoop(testScheduler.scheduler, new FixedTimestepClock(0.1), {
      update: (deltaSeconds) => {
        updates.push(deltaSeconds);
      },
      render: (interpolation) => {
        renders.push(interpolation);
      },
    });

    loop.start();
    loop.start();
    testScheduler.runNextFrame(1000);
    testScheduler.runNextFrame(1150);

    expect(loop.isRunning).toBe(true);
    expect(updates).toEqual([0.1]);
    expect(renders).toHaveLength(2);
    expect(renders[1]).toBeCloseTo(0.5);
    expect(testScheduler.frames).toHaveLength(1);
  });

  it('stops and cancels the pending frame', () => {
    const testScheduler = createTestScheduler();
    const loop = new GameLoop(testScheduler.scheduler, new FixedTimestepClock(), {
      update: vi.fn(),
      render: vi.fn(),
    });

    loop.start();
    loop.stop();
    loop.stop();

    expect(loop.isRunning).toBe(false);
    expect(testScheduler.cancelledHandles).toEqual([1]);
  });

  it('does not schedule or process frames after stopping', () => {
    const testScheduler = createTestScheduler();
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(testScheduler.scheduler, new FixedTimestepClock(), {
      update,
      render,
    });

    loop.start();
    const pendingFrame = testScheduler.frames[0];
    loop.stop();
    pendingFrame?.callback(1000);

    expect(update).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    expect(testScheduler.frames).toHaveLength(0);
  });
});
