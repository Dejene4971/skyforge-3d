export type PerformanceStats = {
  readonly fps: number;
  readonly frameTimeMilliseconds: number;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly entities: number;
};

export type PerformanceTextSink = {
  textContent: string | null;
};

export class PerformanceOverlay {
  public constructor(private readonly sink: PerformanceTextSink) {}

  public update(stats: PerformanceStats): void {
    validateStats(stats);
    this.sink.textContent = [
      `FPS: ${Math.round(stats.fps)}`,
      `Frame: ${stats.frameTimeMilliseconds.toFixed(2)} ms`,
      `Draw calls: ${Math.round(stats.drawCalls)}`,
      `Triangles: ${Math.round(stats.triangles)}`,
      `Entities: ${Math.round(stats.entities)}`,
    ].join('\n');
  }
}

export const createPerformanceOverlayElement = (document: Document): HTMLPreElement => {
  const element = document.createElement('pre');
  element.id = 'performance-overlay';
  element.setAttribute('aria-label', 'Performance statistics');
  element.style.position = 'fixed';
  element.style.top = '8px';
  element.style.left = '8px';
  element.style.margin = '0';
  element.style.padding = '8px';
  element.style.color = '#d9f99d';
  element.style.backgroundColor = 'rgba(10, 18, 16, 0.82)';
  element.style.font = '12px/1.4 monospace';
  element.style.pointerEvents = 'none';
  element.style.zIndex = '1000';
  element.textContent = 'Performance data unavailable';
  document.body.append(element);
  return element;
};

const validateStats = (stats: PerformanceStats): void => {
  const values = [
    stats.fps,
    stats.frameTimeMilliseconds,
    stats.drawCalls,
    stats.triangles,
    stats.entities,
  ];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Performance statistics must be non-negative finite numbers.');
  }
};
