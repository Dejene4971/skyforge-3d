export type AttackDefinition = {
  readonly id: string;
  readonly durationSeconds: number;
  readonly hitStartSeconds: number;
  readonly hitEndSeconds: number;
  readonly recoverySeconds: number;
  readonly staminaCost: number;
  readonly damageMultiplier: number;
};

export const validateAttackDefinition = (attack: AttackDefinition): void => {
  if (attack.id.trim().length === 0) {
    throw new Error('Attack definition ID must not be empty.');
  }

  const values = [
    attack.durationSeconds,
    attack.hitStartSeconds,
    attack.hitEndSeconds,
    attack.recoverySeconds,
    attack.staminaCost,
    attack.damageMultiplier,
  ];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Attack definition values must be non-negative finite numbers.');
  }
  if (
    attack.durationSeconds <= 0 ||
    attack.hitStartSeconds >= attack.hitEndSeconds ||
    attack.hitEndSeconds > attack.durationSeconds
  ) {
    throw new Error('Attack timing windows must fit within attack duration.');
  }
  if (attack.damageMultiplier <= 0) {
    throw new Error('Attack damage multiplier must be greater than zero.');
  }
};

export const createStarterAttackDefinitions = (): readonly AttackDefinition[] => [
  {
    id: 'warden-slash-1',
    durationSeconds: 0.3,
    hitStartSeconds: 0.1,
    hitEndSeconds: 0.2,
    recoverySeconds: 0.2,
    staminaCost: 10,
    damageMultiplier: 1,
  },
  {
    id: 'warden-slash-2',
    durationSeconds: 0.35,
    hitStartSeconds: 0.12,
    hitEndSeconds: 0.24,
    recoverySeconds: 0.25,
    staminaCost: 12,
    damageMultiplier: 1.2,
  },
];

export const validateAttackDefinitions = (attacks: readonly AttackDefinition[]): void => {
  if (attacks.length === 0) {
    throw new Error('Attack definitions must contain at least one attack.');
  }

  const ids = new Set<string>();
  for (const attack of attacks) {
    validateAttackDefinition(attack);
    if (ids.has(attack.id)) {
      throw new Error(`Duplicate attack definition ID: ${attack.id}.`);
    }
    ids.add(attack.id);
  }
};
