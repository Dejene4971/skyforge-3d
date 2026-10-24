import { describe, expect, it } from 'vitest';
import { CombatStats } from '../../../src/domain/combat/CombatStats';

const createStats = () =>
  new CombatStats({
    maxHealth: 100,
    maxStamina: 40,
    attackPower: 15,
    defense: 8,
    poise: 20,
    resistances: { fire: 0.25 },
  });

describe('CombatStats', () => {
  it('initializes configured attributes and full resources', () => {
    const stats = createStats();

    expect(stats.maxHealth).toBe(100);
    expect(stats.attackPower).toBe(15);
    expect(stats.resistances).toEqual({
      physical: 0,
      fire: 0.25,
      poison: 0,
    });
    expect(stats.snapshot).toEqual({
      health: 100,
      stamina: 40,
      poise: 20,
    });
  });

  it('spends and restores stamina within its limits', () => {
    const stats = createStats();

    expect(stats.spendStamina(15)).toBe(true);
    expect(stats.snapshot.stamina).toBe(25);
    expect(stats.spendStamina(30)).toBe(false);
    expect(stats.restoreStamina(50)).toBe(40);
  });

  it('applies damage, healing, and defeated state within health limits', () => {
    const stats = createStats();

    expect(stats.applyDamage(30)).toBe(30);
    expect(stats.heal(10)).toBe(80);
    expect(stats.applyDamage(200)).toBe(80);
    expect(stats.isDefeated).toBe(true);
    expect(stats.heal(5)).toBe(5);
    expect(stats.isDefeated).toBe(false);
  });

  it('resets mutable combat state', () => {
    const stats = createStats();

    stats.applyDamage(40);
    stats.spendStamina(10);
    expect(stats.reset()).toEqual({
      health: 100,
      stamina: 40,
      poise: 20,
    });
  });

  it('rejects invalid definitions, states, resistances, and resource amounts', () => {
    expect(
      () => new CombatStats({ maxHealth: 0, maxStamina: 1, attackPower: 1, defense: 1, poise: 1 }),
    ).toThrow('Maximum health must be greater than zero.');
    expect(
      () =>
        new CombatStats({
          maxHealth: 10,
          maxStamina: 1,
          attackPower: 1,
          defense: 1,
          poise: 1,
          resistances: { fire: 2 },
        }),
    ).toThrow('fire resistance must be between zero and one.');
    expect(
      () =>
        new CombatStats(
          {
            maxHealth: 10,
            maxStamina: 1,
            attackPower: 1,
            defense: 1,
            poise: 1,
          },
          { health: 11 },
        ),
    ).toThrow('Initial combat state is outside the configured stat limits.');

    const stats = createStats();
    expect(() => stats.applyDamage(-1)).toThrow('Damage must be a non-negative finite number.');
    expect(() => stats.spendStamina(Number.NaN)).toThrow(
      'Stamina cost must be a non-negative finite number.',
    );
  });
});
