import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { PlayerEntity } from '../../../src/runtime/entities/PlayerEntity';

describe('PlayerEntity', () => {
  it('applies movement state to the visual object', () => {
    const visual = new THREE.Group();
    const player = new PlayerEntity({
      visual,
      movement: {
        maxSpeed: 4,
        acceleration: 100,
      },
    });

    player.update({ x: 1, y: 0 }, 0.5);

    expect(visual.name).toBe('player');
    expect(visual.position.x).toBeCloseTo(2);
    expect(visual.position.y).toBe(0);
    expect(visual.position.z).toBe(0);
    expect(visual.rotation.y).toBeCloseTo(Math.PI / 2);
  });

  it('uses the configured initial movement state', () => {
    const player = new PlayerEntity({
      initialState: {
        position: { x: 3, z: -2 },
        velocity: { x: 0, y: 0 },
        facingRadians: Math.PI,
      },
    });

    expect(player.object.position.toArray()).toEqual([3, 0, -2]);
    expect(player.object.rotation.y).toBe(Math.PI);
  });

  it('resets the visual transform to a new movement state', () => {
    const player = new PlayerEntity();

    player.update({ x: 1, y: 0 }, 1);
    player.reset({
      position: { x: -4, z: 2 },
      velocity: { x: 0, y: 0 },
      facingRadians: -Math.PI / 2,
    });

    expect(player.object.position.toArray()).toEqual([-4, 0, 2]);
    expect(player.object.rotation.y).toBe(-Math.PI / 2);

    player.update({ x: 0, y: 0 }, 0);
    expect(player.object.position.toArray()).toEqual([-4, 0, 2]);
  });
});
