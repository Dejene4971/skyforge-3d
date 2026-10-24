import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { SceneManager } from '../../src/rendering/SceneManager';

describe('SceneManager', () => {
  it('attaches a newly created scene root', () => {
    const scene = new THREE.Scene();
    const manager = new SceneManager(scene);
    const root = new THREE.Group();

    manager.transitionTo(() => ({ root }));

    expect(manager.activeRoot).toBe(root);
    expect(scene.children).toContain(root);
  });

  it('detaches and disposes the previous scene during transition', () => {
    const scene = new THREE.Scene();
    const manager = new SceneManager(scene);
    const firstRoot = new THREE.Group();
    const secondRoot = new THREE.Group();
    const dispose = vi.fn();

    manager.transitionTo(() => ({ root: firstRoot, dispose }));
    manager.transitionTo(() => ({ root: secondRoot }));

    expect(dispose).toHaveBeenCalledOnce();
    expect(scene.children).not.toContain(firstRoot);
    expect(scene.children).toContain(secondRoot);
    expect(manager.activeRoot).toBe(secondRoot);
  });

  it('does not mutate the active scene when scene creation fails', () => {
    const scene = new THREE.Scene();
    const manager = new SceneManager(scene);
    const root = new THREE.Group();

    manager.transitionTo(() => ({ root }));

    expect(() => {
      manager.transitionTo(() => {
        throw new Error('scene creation failed');
      });
    }).toThrow('scene creation failed');

    expect(manager.activeRoot).toBe(root);
    expect(scene.children).toContain(root);
  });

  it('clears and disposes the active scene', () => {
    const scene = new THREE.Scene();
    const manager = new SceneManager(scene);
    const root = new THREE.Group();
    const dispose = vi.fn();

    manager.transitionTo(() => ({ root, dispose }));
    manager.clear();
    manager.clear();

    expect(dispose).toHaveBeenCalledOnce();
    expect(manager.activeRoot).toBeUndefined();
    expect(scene.children).not.toContain(root);
  });
});
