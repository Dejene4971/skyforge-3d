import * as THREE from 'three';

export type CameraCollisionQuery = (origin: THREE.Vector3, desiredDistance: number) => number;

export type ThirdPersonCameraOptions = {
  readonly distance?: number;
  readonly height?: number;
  readonly smoothing?: number;
  readonly lookSensitivity?: number;
  readonly minPitch?: number;
  readonly maxPitch?: number;
};

export class ThirdPersonCamera {
  private readonly targetPosition = new THREE.Vector3();
  private readonly desiredPosition = new THREE.Vector3();
  private readonly offset = new THREE.Vector3();
  private readonly lookAtPosition = new THREE.Vector3();
  private yaw = 0;
  private pitch = -0.25;
  private currentDistance: number;

  private readonly distance: number;
  private readonly height: number;
  private readonly smoothing: number;
  private readonly lookSensitivity: number;
  private readonly minPitch: number;
  private readonly maxPitch: number;

  public constructor(
    private readonly camera: THREE.PerspectiveCamera,
    options: ThirdPersonCameraOptions = {},
  ) {
    this.distance = options.distance ?? 5;
    this.height = options.height ?? 1.6;
    this.smoothing = options.smoothing ?? 12;
    this.lookSensitivity = options.lookSensitivity ?? 0.003;
    this.minPitch = options.minPitch ?? -1.1;
    this.maxPitch = options.maxPitch ?? 0.45;
    this.currentDistance = this.distance;

    if (!Number.isFinite(this.distance) || this.distance <= 0) {
      throw new Error('Camera distance must be a positive finite number.');
    }
    if (!Number.isFinite(this.height)) {
      throw new Error('Camera height must be finite.');
    }
    if (!Number.isFinite(this.smoothing) || this.smoothing < 0) {
      throw new Error('Camera smoothing must be a non-negative finite number.');
    }
    if (!Number.isFinite(this.lookSensitivity) || this.lookSensitivity <= 0) {
      throw new Error('Camera look sensitivity must be a positive finite number.');
    }
    if (
      !Number.isFinite(this.minPitch) ||
      !Number.isFinite(this.maxPitch) ||
      this.minPitch >= this.maxPitch
    ) {
      throw new Error('Camera pitch limits must be finite and ordered.');
    }
  }

  public update(
    target: THREE.Vector3,
    lookDelta: THREE.Vector2,
    deltaSeconds: number,
    collisionQuery?: CameraCollisionQuery,
  ): void {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new Error('Camera delta time must be a non-negative finite number.');
    }

    this.targetPosition.copy(target);
    this.yaw -= lookDelta.x * this.lookSensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch - lookDelta.y * this.lookSensitivity,
      this.minPitch,
      this.maxPitch,
    );

    const availableDistance = collisionQuery
      ? THREE.MathUtils.clamp(
          collisionQuery(this.targetPosition, this.distance),
          0.1,
          this.distance,
        )
      : this.distance;
    this.currentDistance = availableDistance;

    this.offset.set(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch),
    );
    this.desiredPosition
      .copy(this.targetPosition)
      .addScaledVector(this.offset, this.currentDistance);
    this.desiredPosition.y += this.height;

    const smoothingFactor = 1 - Math.exp(-this.smoothing * deltaSeconds);
    this.camera.position.lerp(this.desiredPosition, smoothingFactor);
    this.lookAtPosition.copy(this.targetPosition);
    this.lookAtPosition.y += this.height;
    this.camera.lookAt(this.lookAtPosition);
  }

  public snapToTarget(target: THREE.Vector3): void {
    this.camera.position.copy(target);
    this.camera.position.y += this.height;
    this.currentDistance = this.distance;
    this.update(target, new THREE.Vector2(), 1);
  }

  public get currentFollowDistance(): number {
    return this.currentDistance;
  }
}
