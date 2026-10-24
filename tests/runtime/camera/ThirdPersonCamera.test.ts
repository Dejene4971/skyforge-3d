import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ThirdPersonCamera } from '../../../src/runtime/camera/ThirdPersonCamera';

describe('ThirdPersonCamera', () => {
  it('follows the target while looking toward it', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new ThirdPersonCamera(camera, {
      distance: 5,
      height: 2,
      smoothing: 100,
    });

    controller.update(new THREE.Vector3(0, 0, 0), new THREE.Vector2(), 1);

    expect(camera.position.y).toBeGreaterThan(0);
    expect(camera.position.z).toBeGreaterThan(0);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    expect(direction.y).toBeGreaterThan(0);
  });

  it('clamps pitch and applies look sensitivity', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new ThirdPersonCamera(camera, {
      distance: 4,
      smoothing: 100,
      lookSensitivity: 0.01,
      minPitch: -0.5,
      maxPitch: 0.5,
    });

    controller.update(new THREE.Vector3(), new THREE.Vector2(0, -20), 1);
    const firstPosition = camera.position.clone();
    controller.update(new THREE.Vector3(), new THREE.Vector2(0, -1_000), 1);

    expect(camera.position.y).toBeGreaterThan(firstPosition.y);
    expect(camera.position.y).toBeLessThan(10);
  });

  it('shortens the camera arm when collision reduces available distance', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new ThirdPersonCamera(camera, {
      distance: 6,
      smoothing: 100,
    });

    controller.update(new THREE.Vector3(), new THREE.Vector2(), 1, () => 2);

    expect(controller.currentFollowDistance).toBe(2);
    expect(camera.position.length()).toBeGreaterThan(1);
    expect(camera.position.length()).toBeLessThan(4);
  });

  it('rejects invalid configuration and delta values', () => {
    const camera = new THREE.PerspectiveCamera();

    expect(() => new ThirdPersonCamera(camera, { distance: 0 })).toThrow(
      'Camera distance must be a positive finite number.',
    );
    expect(() => new ThirdPersonCamera(camera, { minPitch: 1, maxPitch: 1 })).toThrow(
      'Camera pitch limits must be finite and ordered.',
    );

    const controller = new ThirdPersonCamera(camera);
    expect(() => controller.update(new THREE.Vector3(), new THREE.Vector2(), -1)).toThrow(
      'Camera delta time must be a non-negative finite number.',
    );
  });
});
