import * as THREE from 'three';

export type SceneHandle = {
  readonly root: THREE.Group;
  readonly dispose?: () => void;
};

export type SceneFactory = () => SceneHandle;

export class SceneManager {
  private activeScene: SceneHandle | undefined;

  public constructor(private readonly scene: THREE.Scene) {}

  public get activeRoot(): THREE.Group | undefined {
    return this.activeScene?.root;
  }

  public transitionTo(createScene: SceneFactory): void {
    const nextScene = createScene();
    this.detachActiveScene();

    this.scene.add(nextScene.root);
    this.activeScene = nextScene;
  }

  public clear(): void {
    this.detachActiveScene();
  }

  private detachActiveScene(): void {
    if (!this.activeScene) {
      return;
    }

    this.scene.remove(this.activeScene.root);
    this.activeScene.dispose?.();
    this.activeScene = undefined;
  }
}
