import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { MeleeHitDetection, type MeleeTarget } from '../../../src/runtime/combat/MeleeHitDetection';

const createTarget = (
  entityId: string,
  position: [number, number, number],
  metadata: Partial<MeleeTarget> = {},
): MeleeTarget => {
  const object = new THREE.Object3D();
  object.position.set(...position);
  return {
    entityId,
    object,
    radius: 0.25,
    ...metadata,
  };
};

describe('MeleeHitDetection', () => {
  it('queries targets using world-space origin and facing', () => {
    const origin = new THREE.Object3D();
    origin.rotation.y = Math.PI;
    const detection = new MeleeHitDetection();

    const results = detection.query(
      {
        origin,
        range: 3,
        radius: 0.2,
        angleRadians: Math.PI / 4,
      },
      [createTarget('front', [0, 0, -2]), createTarget('behind', [0, 0, 2])],
    );

    expect(results.map((result) => result.entityId)).toEqual(['front']);
  });

  it('preserves target damage metadata', () => {
    const detection = new MeleeHitDetection();
    const origin = new THREE.Object3D();

    const results = detection.query(
      {
        origin,
        range: 3,
        radius: 0.2,
        angleRadians: Math.PI / 2,
      },
      [
        createTarget('burning-target', [0, 0, 1], {
          damageMultiplier: 1.5,
          damageType: 'fire',
        }),
      ],
    );

    expect(results[0]).toMatchObject({
      entityId: 'burning-target',
      damageMultiplier: 1.5,
      damageType: 'fire',
    });
  });

  it('supports parent transforms when resolving target positions', () => {
    const parent = new THREE.Group();
    parent.position.set(2, 0, 0);
    const target = createTarget('nested', [0, 0, 1]);
    parent.add(target.object);
    parent.updateMatrixWorld(true);

    const detection = new MeleeHitDetection();
    const results = detection.query(
      {
        origin: new THREE.Object3D(),
        range: 3,
        radius: 0.25,
        angleRadians: Math.PI / 2,
      },
      [target],
    );

    expect(results).toHaveLength(1);
  });
});
