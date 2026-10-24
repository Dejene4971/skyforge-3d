import * as THREE from 'three';
import { createLightingRig } from './Lighting';
import type { SceneHandle } from './SceneManager';

export type PrototypeArenaOptions = {
  readonly width?: number;
  readonly depth?: number;
  readonly propCount?: number;
};

export const createPrototypeArena = (
  camera: THREE.PerspectiveCamera,
  options: PrototypeArenaOptions = {},
): SceneHandle => {
  const width = options.width ?? 24;
  const depth = options.depth ?? 18;
  const propCount = options.propCount ?? 8;

  validatePositiveDimension(width, 'Arena width');
  validatePositiveDimension(depth, 'Arena depth');
  if (!Number.isInteger(propCount) || propCount < 0) {
    throw new Error('Prop count must be a non-negative integer.');
  }

  const root = new THREE.Group();
  root.name = 'prototype-arena';
  const resources: DisposableResource[] = [];

  const groundGeometry = track(resources, new THREE.PlaneGeometry(width, depth));
  const groundMaterial = track(resources, new THREE.MeshStandardMaterial({ color: 0x263b32 }));
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.name = 'arena-ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  const boundaryGeometry = track(resources, new THREE.BoxGeometry(width, 1.5, 0.4));
  const boundaryMaterial = track(resources, new THREE.MeshStandardMaterial({ color: 0x18221f }));
  const boundaries = [
    createBoundary(boundaryGeometry, boundaryMaterial, 0, 0.75, -depth / 2),
    createBoundary(boundaryGeometry, boundaryMaterial, 0, 0.75, depth / 2),
  ];
  const sideBoundaries = [
    createBoundary(boundaryGeometry, boundaryMaterial, -width / 2, 0.75, 0, true),
    createBoundary(boundaryGeometry, boundaryMaterial, width / 2, 0.75, 0, true),
  ];
  root.add(...boundaries, ...sideBoundaries);

  const propGeometry = track(resources, new THREE.CylinderGeometry(0.35, 0.55, 1.6, 8));
  const propMaterial = track(resources, new THREE.MeshStandardMaterial({ color: 0x6b4631 }));
  for (let index = 0; index < propCount; index += 1) {
    const prop = new THREE.Mesh(propGeometry, propMaterial);
    const angle = (index / Math.max(propCount, 1)) * Math.PI * 2;
    prop.name = `arena-prop-${index}`;
    prop.position.set(Math.cos(angle) * width * 0.32, 0.8, Math.sin(angle) * depth * 0.32);
    prop.castShadow = true;
    prop.receiveShadow = true;
    root.add(prop);
  }

  const lighting = createLightingRig();
  root.add(lighting.root);

  camera.position.set(0, Math.max(width, depth) * 0.75, Math.max(width, depth) * 0.85);
  camera.lookAt(0, 0, 0);

  return {
    root,
    dispose: () => {
      lighting.dispose();
      for (const resource of resources) {
        resource.dispose();
      }
      root.clear();
    },
  };
};

const createBoundary = (
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  rotate = false,
): THREE.Mesh => {
  const boundary = new THREE.Mesh(geometry, material);
  boundary.name = 'arena-boundary';
  boundary.position.set(x, y, z);
  boundary.rotation.y = rotate ? Math.PI / 2 : 0;
  boundary.castShadow = true;
  boundary.receiveShadow = true;
  return boundary;
};

type DisposableResource = {
  dispose: () => void;
};

const track = <T extends DisposableResource>(resources: DisposableResource[], resource: T): T => {
  resources.push(resource);
  return resource;
};

const validatePositiveDimension = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
};
