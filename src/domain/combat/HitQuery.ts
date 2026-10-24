import type { DamageType } from './CombatStats';

export type CombatVector3 = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

export type AttackVolume = {
  readonly origin: CombatVector3;
  readonly forward: CombatVector3;
  readonly range: number;
  readonly radius: number;
  readonly angleRadians: number;
};

export type HitTarget = {
  readonly entityId: string;
  readonly position: CombatVector3;
  readonly radius: number;
  readonly damageMultiplier?: number;
  readonly damageType?: DamageType;
};

export type HitResult = {
  readonly entityId: string;
  readonly distance: number;
  readonly damageMultiplier: number;
  readonly damageType: DamageType;
};

export type HitQuery = (
  volume: AttackVolume,
  targets: readonly HitTarget[],
) => readonly HitResult[];

export const queryAttackVolume: HitQuery = (volume, targets) => {
  validateVolume(volume);
  const forward = normalize(volume.forward);
  const results: HitResult[] = [];
  const seenTargets = new Set<string>();

  for (const target of targets) {
    validateTarget(target);
    if (seenTargets.has(target.entityId)) {
      continue;
    }

    const offset = subtract(target.position, volume.origin);
    const distance = length(offset);
    if (distance > volume.range + volume.radius + target.radius) {
      continue;
    }

    const direction = distance === 0 ? forward : scale(offset, 1 / distance);
    const angle = Math.acos(clamp(dot(forward, direction), -1, 1));
    if (angle > volume.angleRadians) {
      continue;
    }

    seenTargets.add(target.entityId);
    results.push({
      entityId: target.entityId,
      distance,
      damageMultiplier: target.damageMultiplier ?? 1,
      damageType: target.damageType ?? 'physical',
    });
  }

  return results.sort((first, second) => first.distance - second.distance);
};

const validateVolume = (volume: AttackVolume): void => {
  validateVector(volume.origin, 'Attack origin');
  validateVector(volume.forward, 'Attack forward');
  if (
    !Number.isFinite(volume.range) ||
    volume.range < 0 ||
    !Number.isFinite(volume.radius) ||
    volume.radius < 0 ||
    !Number.isFinite(volume.angleRadians) ||
    volume.angleRadians < 0 ||
    volume.angleRadians > Math.PI
  ) {
    throw new Error('Attack volume dimensions must be finite and within valid limits.');
  }
  if (length(volume.forward) === 0) {
    throw new Error('Attack forward vector must not be zero.');
  }
};

const validateTarget = (target: HitTarget): void => {
  if (target.entityId.trim().length === 0) {
    throw new Error('Hit target ID must not be empty.');
  }
  validateVector(target.position, 'Hit target position');
  if (!Number.isFinite(target.radius) || target.radius < 0) {
    throw new Error('Hit target radius must be a non-negative finite number.');
  }
  if (
    target.damageMultiplier !== undefined &&
    (!Number.isFinite(target.damageMultiplier) || target.damageMultiplier <= 0)
  ) {
    throw new Error('Hit target damage multiplier must be positive and finite.');
  }
};

const validateVector = (vector: CombatVector3, label: string): void => {
  if (![vector.x, vector.y, vector.z].every(Number.isFinite)) {
    throw new Error(`${label} must contain finite numbers.`);
  }
};

const normalize = (vector: CombatVector3): CombatVector3 => {
  const magnitude = length(vector);
  return scale(vector, 1 / magnitude);
};

const subtract = (first: CombatVector3, second: CombatVector3): CombatVector3 => ({
  x: first.x - second.x,
  y: first.y - second.y,
  z: first.z - second.z,
});

const scale = (vector: CombatVector3, scalar: number): CombatVector3 => ({
  x: vector.x * scalar,
  y: vector.y * scalar,
  z: vector.z * scalar,
});

const dot = (first: CombatVector3, second: CombatVector3): number =>
  first.x * second.x + first.y * second.y + first.z * second.z;

const length = (vector: CombatVector3): number => Math.hypot(vector.x, vector.y, vector.z);

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));
