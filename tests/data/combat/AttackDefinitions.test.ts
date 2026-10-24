import { describe, expect, it } from 'vitest';
import {
  createStarterAttackDefinitions,
  validateAttackDefinition,
  validateAttackDefinitions,
} from '../../../src/data/combat/AttackDefinitions';

describe('attack definitions', () => {
  it('provides valid starter attack definitions', () => {
    const attacks = createStarterAttackDefinitions();

    validateAttackDefinitions(attacks);

    expect(attacks.map((attack) => attack.id)).toEqual(['warden-slash-1', 'warden-slash-2']);
  });

  it('rejects empty IDs, invalid timing, and invalid damage multipliers', () => {
    expect(() =>
      validateAttackDefinition({
        id: ' ',
        durationSeconds: 0.3,
        hitStartSeconds: 0.1,
        hitEndSeconds: 0.2,
        recoverySeconds: 0.2,
        staminaCost: 1,
        damageMultiplier: 1,
      }),
    ).toThrow('Attack definition ID must not be empty.');

    expect(() =>
      validateAttackDefinition({
        id: 'invalid-window',
        durationSeconds: 0.2,
        hitStartSeconds: 0.2,
        hitEndSeconds: 0.3,
        recoverySeconds: 0.1,
        staminaCost: 1,
        damageMultiplier: 1,
      }),
    ).toThrow('Attack timing windows must fit within attack duration.');

    expect(() =>
      validateAttackDefinition({
        id: 'invalid-damage',
        durationSeconds: 0.2,
        hitStartSeconds: 0.05,
        hitEndSeconds: 0.1,
        recoverySeconds: 0.1,
        staminaCost: 1,
        damageMultiplier: 0,
      }),
    ).toThrow('Attack damage multiplier must be greater than zero.');
  });

  it('rejects empty and duplicate definition sets', () => {
    expect(() => validateAttackDefinitions([])).toThrow(
      'Attack definitions must contain at least one attack.',
    );
    const [attack] = createStarterAttackDefinitions();
    expect(() => validateAttackDefinitions([attack, attack])).toThrow(
      'Duplicate attack definition ID: warden-slash-1.',
    );
  });
});
