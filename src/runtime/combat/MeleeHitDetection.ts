import * as THREE from 'three';
import {
  queryAttackVolume,
  type AttackVolume,
  type CombatVector3,
  type HitResult,
  type HitTarget,
} from '../../domain/combat/HitQuery';
import type { DamageType } from '../../domain/combat/CombatStats';

export type MeleeTarget = {
  readonly entityId: string;
  readonly object: THREE.Object3D;
  readonly radius: number;
  readonly damageMultiplier?: number;
  readonly damageType?: DamageType;
};

export type MeleeHitQueryOptions = {
  readonly origin: THREE.Object3D;
  readonly range: number;
  readonly radius: number;
  readonly angleRadians: number;
};

export class MeleeHitDetection {
  private readonly forward = new THREE.Vector3();
  private readonly origin = new THREE.Vector3();

  public query(
    options: MeleeHitQueryOptions,
    targets: readonly MeleeTarget[],
  ): readonly HitResult[] {
    options.origin.getWorldPosition(this.origin);
    options.origin.getWorldDirection(this.forward);

    const volume: AttackVolume = {
      origin: toCombatVector(this.origin),
      forward: toCombatVector(this.forward),
      range: options.range,
      radius: options.radius,
      angleRadians: options.angleRadians,
    };
    const hitTargets = targets.map((target) => this.toHitTarget(target));

    return queryAttackVolume(volume, hitTargets);
  }

  private readonly toHitTarget = (target: MeleeTarget): HitTarget => {
    const position = new THREE.Vector3();
    target.object.getWorldPosition(position);

    return {
      entityId: target.entityId,
      position: toCombatVector(position),
      radius: target.radius,
      damageMultiplier: target.damageMultiplier,
      damageType: target.damageType,
    };
  };
}

const toCombatVector = (vector: THREE.Vector3): CombatVector3 => ({
  x: vector.x,
  y: vector.y,
  z: vector.z,
});
