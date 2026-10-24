import * as THREE from 'three';

export type LightingOptions = {
  readonly ambientColor?: THREE.ColorRepresentation;
  readonly ambientIntensity?: number;
  readonly keyColor?: THREE.ColorRepresentation;
  readonly keyIntensity?: number;
  readonly keyPosition?: THREE.Vector3;
  readonly castShadows?: boolean;
};

export type LightingRig = {
  readonly root: THREE.Group;
  readonly ambientLight: THREE.AmbientLight;
  readonly keyLight: THREE.DirectionalLight;
  readonly dispose: () => void;
};

export const createLightingRig = (options: LightingOptions = {}): LightingRig => {
  const ambientIntensity = options.ambientIntensity ?? 0.6;
  const keyIntensity = options.keyIntensity ?? 1.4;

  if (!Number.isFinite(ambientIntensity) || ambientIntensity < 0) {
    throw new Error('Ambient light intensity must be a non-negative finite number.');
  }

  if (!Number.isFinite(keyIntensity) || keyIntensity < 0) {
    throw new Error('Key light intensity must be a non-negative finite number.');
  }

  const root = new THREE.Group();
  root.name = 'lighting-rig';

  const ambientLight = new THREE.AmbientLight(options.ambientColor ?? 0x94a7b8, ambientIntensity);
  ambientLight.name = 'ambient-fill';

  const keyLight = new THREE.DirectionalLight(options.keyColor ?? 0xffd7a1, keyIntensity);
  keyLight.name = 'key-light';
  keyLight.position.copy(options.keyPosition ?? new THREE.Vector3(8, 12, 6));
  keyLight.castShadow = options.castShadows ?? true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 60;
  keyLight.shadow.camera.left = -20;
  keyLight.shadow.camera.right = 20;
  keyLight.shadow.camera.top = 20;
  keyLight.shadow.camera.bottom = -20;

  root.add(ambientLight, keyLight);

  return {
    root,
    ambientLight,
    keyLight,
    dispose: () => {
      root.remove(ambientLight, keyLight);
      keyLight.shadow.map?.dispose();
    },
  };
};
