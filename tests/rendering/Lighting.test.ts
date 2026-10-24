import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createLightingRig } from '../../src/rendering/Lighting';

describe('createLightingRig', () => {
  it('creates the configured ambient and key lights', () => {
    const rig = createLightingRig({
      ambientColor: 0x112233,
      ambientIntensity: 0.4,
      keyColor: 0xff0000,
      keyIntensity: 1.2,
      keyPosition: new THREE.Vector3(4, 8, 2),
      castShadows: false,
    });

    expect(rig.root.name).toBe('lighting-rig');
    expect(rig.ambientLight.color.getHex()).toBe(0x112233);
    expect(rig.ambientLight.intensity).toBe(0.4);
    expect(rig.keyLight.color.getHex()).toBe(0xff0000);
    expect(rig.keyLight.intensity).toBe(1.2);
    expect(rig.keyLight.position.toArray()).toEqual([4, 8, 2]);
    expect(rig.keyLight.castShadow).toBe(false);
    expect(rig.root.children).toEqual([rig.ambientLight, rig.keyLight]);
  });

  it('uses readable fantasy lighting defaults', () => {
    const rig = createLightingRig();

    expect(rig.ambientLight.intensity).toBe(0.6);
    expect(rig.keyLight.intensity).toBe(1.4);
    expect(rig.keyLight.castShadow).toBe(true);
    expect(rig.keyLight.shadow.mapSize.toArray()).toEqual([1024, 1024]);
  });

  it('removes lights when disposed', () => {
    const rig = createLightingRig();

    rig.dispose();

    expect(rig.root.children).toHaveLength(0);
  });

  it('rejects invalid intensities', () => {
    expect(() => createLightingRig({ ambientIntensity: -1 })).toThrow(
      'Ambient light intensity must be a non-negative finite number.',
    );
    expect(() => createLightingRig({ keyIntensity: Number.NaN })).toThrow(
      'Key light intensity must be a non-negative finite number.',
    );
  });
});
