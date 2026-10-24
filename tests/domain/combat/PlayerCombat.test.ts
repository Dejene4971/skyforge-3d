import { describe, expect, it } from 'vitest';
import { PlayerCombat } from '../../../src/domain/combat/PlayerCombat';
import { CombatStats } from '../../../src/domain/combat/CombatStats';

const createCombat = () => {
  const stats = new CombatStats({
    maxHealth: 100,
    maxStamina: 50,
    attackPower: 10,
    defense: 5,
    poise: 10,
  });
  const combat = new PlayerCombat(stats, {
    attacks: [
      {
        id: 'test-attack-1',
        durationSeconds: 0.3,
        hitStartSeconds: 0.1,
        hitEndSeconds: 0.2,
        recoverySeconds: 0.2,
        staminaCost: 10,
        damageMultiplier: 1,
      },
      {
        id: 'test-attack-2',
        durationSeconds: 0.35,
        hitStartSeconds: 0.12,
        hitEndSeconds: 0.24,
        recoverySeconds: 0.25,
        staminaCost: 12,
        damageMultiplier: 1.2,
      },
    ],
  });
  return { combat, stats };
};

describe('PlayerCombat', () => {
  it('starts an attack and emits one hit-window event', () => {
    const { combat, stats } = createCombat();

    expect(combat.startAttack()).toBe(true);
    expect(combat.snapshot.name).toBe('attack');
    expect(stats.snapshot.stamina).toBe(40);
    expect(combat.update(0.05)).toBe(false);
    expect(combat.update(0.06)).toBe(true);
    expect(combat.isAttackActive).toBe(true);
    expect(combat.update(0.05)).toBe(false);
  });

  it('moves through recovery and supports an attack chain', () => {
    const { combat } = createCombat();

    combat.startAttack();
    combat.update(0.3);
    expect(combat.snapshot.name).toBe('recovery');
    expect(combat.startAttack()).toBe(true);
    expect(combat.snapshot.attackIndex).toBe(1);
  });

  it('rejects attacks without enough stamina', () => {
    const { combat, stats } = createCombat();

    stats.spendStamina(45);

    expect(combat.startAttack()).toBe(false);
    expect(combat.snapshot.name).toBe('idle');
  });

  it('handles dodge, hit stun, and defeated states', () => {
    const { combat, stats } = createCombat();

    expect(combat.startDodge()).toBe(true);
    expect(combat.receiveHit()).toBe(false);
    combat.update(0.35);
    expect(combat.snapshot.name).toBe('idle');
    expect(combat.receiveHit()).toBe(true);
    expect(combat.snapshot.name).toBe('hit');
    combat.update(0.25);
    expect(combat.snapshot.name).toBe('idle');
    stats.applyDamage(100);
    expect(combat.receiveHit()).toBe(true);
    expect(combat.snapshot.name).toBe('defeated');
    expect(combat.update(1)).toBe(false);
  });

  it('rejects invalid attacks and delta values', () => {
    const { stats } = createCombat();

    expect(() => new PlayerCombat(stats, { attacks: [] })).toThrow(
      'Attack definitions must contain at least one attack.',
    );
    expect(
      () =>
        new PlayerCombat(stats, {
          attacks: [
            {
              durationSeconds: 0.2,
              hitStartSeconds: 0.2,
              hitEndSeconds: 0.3,
              recoverySeconds: 0.1,
              staminaCost: 1,
              id: 'invalid-window',
              damageMultiplier: 1,
            },
          ],
        }),
    ).toThrow('Attack timing windows must fit within attack duration.');

    const { combat } = createCombat();
    expect(() => combat.update(-1)).toThrow(
      'Combat delta time must be a non-negative finite number.',
    );
    expect(
      () =>
        new PlayerCombat(stats, {
          attacks: [
            {
              durationSeconds: 0.2,
              hitStartSeconds: 0.05,
              hitEndSeconds: 0.1,
              recoverySeconds: 0.1,
              staminaCost: 1,
              id: 'invalid-dodge',
              damageMultiplier: 1,
            },
          ],
          dodgeDurationSeconds: 0,
        }),
    ).toThrow('Dodge duration must be a positive finite number.');
  });
});
