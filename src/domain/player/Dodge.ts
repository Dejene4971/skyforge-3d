export type DodgeState = {
  readonly active: boolean;
  readonly elapsedSeconds: number;
  readonly cooldownRemainingSeconds: number;
  readonly invulnerable: boolean;
};

export type DodgeOptions = {
  readonly durationSeconds?: number;
  readonly cooldownSeconds?: number;
  readonly invulnerabilitySeconds?: number;
};

export class PlayerDodge {
  private readonly durationSeconds: number;
  private readonly cooldownSeconds: number;
  private readonly invulnerabilitySeconds: number;
  private state: DodgeState = {
    active: false,
    elapsedSeconds: 0,
    cooldownRemainingSeconds: 0,
    invulnerable: false,
  };

  public constructor(options: DodgeOptions = {}) {
    this.durationSeconds = options.durationSeconds ?? 0.35;
    this.cooldownSeconds = options.cooldownSeconds ?? 0.65;
    this.invulnerabilitySeconds = options.invulnerabilitySeconds ?? 0.2;

    validatePositive(this.durationSeconds, 'Dodge duration');
    validateNonNegative(this.cooldownSeconds, 'Dodge cooldown');
    validatePositive(this.invulnerabilitySeconds, 'Dodge invulnerability duration');

    if (this.invulnerabilitySeconds > this.durationSeconds) {
      throw new Error('Dodge invulnerability duration cannot exceed dodge duration.');
    }
  }

  public get snapshot(): DodgeState {
    return { ...this.state };
  }

  public get canStart(): boolean {
    return !this.state.active && this.state.cooldownRemainingSeconds <= 0;
  }

  public start(): boolean {
    if (!this.canStart) {
      return false;
    }

    this.state = {
      active: true,
      elapsedSeconds: 0,
      cooldownRemainingSeconds: this.cooldownSeconds,
      invulnerable: true,
    };
    return true;
  }

  public reset(): DodgeState {
    this.state = {
      active: false,
      elapsedSeconds: 0,
      cooldownRemainingSeconds: 0,
      invulnerable: false,
    };
    return this.snapshot;
  }

  public update(deltaSeconds: number): DodgeState {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new Error('Dodge delta time must be a non-negative finite number.');
    }

    const elapsedSeconds = this.state.elapsedSeconds + deltaSeconds;
    const cooldownRemainingSeconds = Math.max(
      0,
      this.state.cooldownRemainingSeconds - deltaSeconds,
    );
    const active = this.state.active && elapsedSeconds < this.durationSeconds;
    const invulnerable = active && elapsedSeconds < this.invulnerabilitySeconds;

    this.state = {
      active,
      elapsedSeconds: active ? elapsedSeconds : 0,
      cooldownRemainingSeconds,
      invulnerable,
    };
    return this.snapshot;
  }
}

const validatePositive = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
};

const validateNonNegative = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
};
