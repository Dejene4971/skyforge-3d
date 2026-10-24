import * as THREE from 'three';

export type RendererOptions = {
  readonly canvas?: HTMLCanvasElement;
  readonly pixelRatio?: number;
  readonly antialias?: boolean;
};

export class Renderer {
  public readonly scene = new THREE.Scene();
  public readonly camera: THREE.PerspectiveCamera;
  public readonly webglRenderer: THREE.WebGLRenderer;

  private disposed = false;

  public constructor(options: RendererOptions = {}) {
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1_000);
    this.webglRenderer = new THREE.WebGLRenderer({
      antialias: options.antialias ?? true,
      canvas: options.canvas,
    });
    this.webglRenderer.setPixelRatio(options.pixelRatio ?? Math.min(window.devicePixelRatio, 2));
    this.webglRenderer.setSize(1, 1, false);
    this.scene.background = new THREE.Color(0x10151a);
  }

  public get domElement(): HTMLCanvasElement {
    return this.webglRenderer.domElement;
  }

  public resize(width: number, height: number): void {
    this.assertActive();

    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
      throw new Error('Renderer dimensions must be positive finite numbers.');
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.webglRenderer.setSize(width, height, false);
  }

  public render(): void {
    this.assertActive();
    this.webglRenderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.webglRenderer.dispose();
    this.scene.clear();
    this.disposed = true;
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('Renderer has been disposed.');
    }
  }
}
