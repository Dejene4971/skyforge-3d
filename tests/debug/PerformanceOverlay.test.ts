import { describe, expect, it } from 'vitest';
import { PerformanceOverlay, type PerformanceTextSink } from '../../src/debug/PerformanceOverlay';

describe('PerformanceOverlay', () => {
  it('formats performance statistics for the debug sink', () => {
    const sink: PerformanceTextSink = { textContent: null };
    const overlay = new PerformanceOverlay(sink);

    overlay.update({
      fps: 59.6,
      frameTimeMilliseconds: 16.666,
      drawCalls: 42,
      triangles: 125_000,
      entities: 18,
    });

    expect(sink.textContent).toBe(
      'FPS: 60\nFrame: 16.67 ms\nDraw calls: 42\nTriangles: 125000\nEntities: 18',
    );
  });

  it('rejects invalid statistics', () => {
    const sink: PerformanceTextSink = { textContent: null };
    const overlay = new PerformanceOverlay(sink);

    expect(() =>
      overlay.update({
        fps: -1,
        frameTimeMilliseconds: 16,
        drawCalls: 1,
        triangles: 1,
        entities: 1,
      }),
    ).toThrow('Performance statistics must be non-negative finite numbers.');
    expect(sink.textContent).toBeNull();
  });
});
