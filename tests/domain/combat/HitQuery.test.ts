import { describe, expect, it } from 'vitest';
import {
  queryAttackVolume,
  type AttackVolume,
  type HitTarget,
} from '../../../src/domain/combat/HitQuery';

const volume: AttackVolume = {
  origin: { x: 0, y: 0, z: 0 },
  forward: { x: 0, y: 0, z: 1 },
  range: 3,
  radius: 0.25,
  angleRadians: Math.PI / 4,
};

const target = (entityId: string, position: { x: number; y: number; z: number }): HitTarget => ({
  entityId,
  position,
  radius: 0.25,
});

describe('queryAttackVolume', () => {
  it('returns targets inside range and angle sorted by distance', () => {
    const results = queryAttackVolume(volume, [
      target('far', { x: 0.5, y: 0, z: 2.5 }),
      target('near', { x: 0, y: 0, z: 1 }),
      target('behind', { x: 0, y: 0, z: -1 }),
      target('wide', { x: 3, y: 0, z: 1 }),
    ]);

    expect(results.map((result) => result.entityId)).toEqual(['near', 'far']);
    expect(results[0]?.damageType).toBe('physical');
  });

  it('deduplicates repeated target IDs and preserves target damage metadata', () => {
    const results = queryAttackVolume(volume, [
      {
        ...target('enemy', { x: 0, y: 0, z: 1 }),
        damageMultiplier: 1.5,
        damageType: 'fire',
      },
      target('enemy', { x: 0, y: 0, z: 2 }),
    ]);

    expect(results).toEqual([
      {
        entityId: 'enemy',
        distance: 1,
        damageMultiplier: 1.5,
        damageType: 'fire',
      },
    ]);
  });

  it('accepts targets at the origin and validates volume and target data', () => {
    expect(queryAttackVolume(volume, [target('origin', { x: 0, y: 0, z: 0 })])).toHaveLength(1);
    expect(() => queryAttackVolume({ ...volume, forward: { x: 0, y: 0, z: 0 } }, [])).toThrow(
      'Attack forward vector must not be zero.',
    );
    expect(() => queryAttackVolume(volume, [target(' ', { x: 0, y: 0, z: 1 })])).toThrow(
      'Hit target ID must not be empty.',
    );
  });
});
