import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createPrototypeArena } from '../../src/rendering/PrototypeArena';

describe('createPrototypeArena', () => {
  it('creates the ground, boundaries, props, and lighting', () => {
    const camera = new THREE.PerspectiveCamera();
    const arena = createPrototypeArena(camera, {
      width: 20,
      depth: 12,
      propCount: 4,
    });
    const meshNames: string[] = [];

    arena.root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshNames.push(object.name);
      }
    });

    expect(arena.root.name).toBe('prototype-arena');
    expect(meshNames).toContain('arena-ground');
    expect(meshNames.filter((name) => name === 'arena-boundary')).toHaveLength(4);
    expect(meshNames.filter((name) => name.startsWith('arena-prop-'))).toHaveLength(4);
    expect(arena.root.getObjectByName('lighting-rig')).toBeDefined();
    expect(camera.position.length()).toBeGreaterThan(0);
  });

  it('frames the camera toward the arena center', () => {
    const camera = new THREE.PerspectiveCamera();
    createPrototypeArena(camera);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    expect(direction.y).toBeLessThan(0);
    expect(direction.z).toBeLessThan(0);
  });

  it('clears the arena during disposal', () => {
    const camera = new THREE.PerspectiveCamera();
    const arena = createPrototypeArena(camera, { propCount: 2 });

    arena.dispose?.();

    expect(arena.root.children).toHaveLength(0);
  });

  it('rejects invalid arena configuration', () => {
    const camera = new THREE.PerspectiveCamera();

    expect(() => createPrototypeArena(camera, { width: 0 })).toThrow(
      'Arena width must be a positive finite number.',
    );
    expect(() => createPrototypeArena(camera, { propCount: 1.5 })).toThrow(
      'Prop count must be a non-negative integer.',
    );
  });
});
