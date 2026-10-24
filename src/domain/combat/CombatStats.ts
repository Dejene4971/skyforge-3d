export type DamageType = 'physical' | 'fire' | 'poison';

export type DamageResistances = Readonly<Record<DamageType, number>>;

export type CombatStatsDefinition = {
  readonly maxHealth: number;
  readonly maxStamina: number;
  readonly attackPower: number;
  readonly defense: number;
  readonly poise: number;
  readonly resistances?: Partial<DamageResistances>;
};

export type CombatStatsState = {
  readonly health: number;
  readonly stamina: number;
  readonly poise: number;
};

type MutableCombatStatsState = {
  health: number;
  stamina: number;
  poise: number;
};

const defaultResistances: DamageResistances = {
  physical: 0,
  fire: 0,
  poison: 0,
};

export class CombatStats {
  public readonly maxHealth: number;
  public readonly maxStamina: number;
  public readonly attackPower: number;
  public readonly defense: number;
  public readonly poise: number;
  public readonly resistances: DamageResistances;

  private state: MutableCombatStatsState;

  public constructor(definition: CombatStatsDefinition, initialState?: Partial<CombatStatsState>) {
    validateNonNegative(definition.maxHealth, 'Maximum health');
    validateNonNegative(definition.maxStamina, 'Maximum stamina');
    validateNonNegative(definition.attackPower, 'Attack power');
    validateNonNegative(definition.defense, 'Defense');
    validateNonNegative(definition.poise, 'Poise');

    if (definition.maxHealth <= 0) {
      throw new Error('Maximum health must be greater than zero.');
    }

    this.maxHealth = definition.maxHealth;
    this.maxStamina = definition.maxStamina;
    this.attackPower = definition.attackPower;
    this.defense = definition.defense;
    this.poise = definition.poise;
    this.resistances = {
      ...defaultResistances,
      ...definition.resistances,
    };
    validateResistances(this.resistances);

    this.state = {
      health: initialState?.health ?? this.maxHealth,
      stamina: initialState?.stamina ?? this.maxStamina,
      poise: initialState?.poise ?? this.poise,
    };
    validateState(this.state, this.maxHealth, this.maxStamina, this.poise);
  }

  public get snapshot(): CombatStatsState {
    return { ...this.state };
  }

  public get isDefeated(): boolean {
    return this.state.health <= 0;
  }

  public spendStamina(amount: number): boolean {
    validateNonNegative(amount, 'Stamina cost');
    if (amount > this.state.stamina) {
      return false;
    }

    this.state.stamina -= amount;
    return true;
  }

  public restoreStamina(amount: number): number {
    validateNonNegative(amount, 'Stamina restoration');
    this.state.stamina = Math.min(this.maxStamina, this.state.stamina + amount);
    return this.state.stamina;
  }

  public applyDamage(amount: number): number {
    validateNonNegative(amount, 'Damage');
    const appliedDamage = Math.min(amount, this.state.health);
    this.state.health -= appliedDamage;
    return appliedDamage;
  }

  public heal(amount: number): number {
    validateNonNegative(amount, 'Healing');
    this.state.health = Math.min(this.maxHealth, this.state.health + amount);
    return this.state.health;
  }

  public reset(): CombatStatsState {
    this.state = {
      health: this.maxHealth,
      stamina: this.maxStamina,
      poise: this.poise,
    };
    return this.snapshot;
  }
}

const validateNonNegative = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
};

const validateResistances = (resistances: DamageResistances): void => {
  for (const damageType of Object.keys(defaultResistances) as DamageType[]) {
    const resistance = resistances[damageType];
    if (!Number.isFinite(resistance) || resistance < 0 || resistance > 1) {
      throw new Error(`${damageType} resistance must be between zero and one.`);
    }
  }
};

const validateState = (
  state: CombatStatsState,
  maxHealth: number,
  maxStamina: number,
  maxPoise: number,
): void => {
  if (
    !Number.isFinite(state.health) ||
    state.health < 0 ||
    state.health > maxHealth ||
    !Number.isFinite(state.stamina) ||
    state.stamina < 0 ||
    state.stamina > maxStamina ||
    !Number.isFinite(state.poise) ||
    state.poise < 0 ||
    state.poise > maxPoise
  ) {
    throw new Error('Initial combat state is outside the configured stat limits.');
  }
};
