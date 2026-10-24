import type { CombatStats } from './CombatStats';
import {
  validateAttackDefinitions,
  type AttackDefinition,
} from '../../data/combat/AttackDefinitions';

export type PlayerCombatStateName = 'idle' | 'attack' | 'recovery' | 'dodge' | 'hit' | 'defeated';

export type PlayerCombatState = {
  readonly name: PlayerCombatStateName;
  readonly elapsedSeconds: number;
  readonly attackIndex: number;
};

export type PlayerAttackDefinition = AttackDefinition;

export type PlayerCombatOptions = {
  readonly attacks: readonly PlayerAttackDefinition[];
  readonly hitStunSeconds?: number;
  readonly dodgeDurationSeconds?: number;
};

export class PlayerCombat {
  private readonly hitStunSeconds: number;
  private readonly dodgeDurationSeconds: number;
  private state: PlayerCombatState = {
    name: 'idle',
    elapsedSeconds: 0,
    attackIndex: 0,
  };
  private attackHitEmitted = false;

  public constructor(
    private readonly stats: CombatStats,
    private readonly options: PlayerCombatOptions,
  ) {
    validateAttackDefinitions(options.attacks);

    this.hitStunSeconds = options.hitStunSeconds ?? 0.25;
    if (!Number.isFinite(this.hitStunSeconds) || this.hitStunSeconds <= 0) {
      throw new Error('Hit stun duration must be a positive finite number.');
    }
    this.dodgeDurationSeconds = options.dodgeDurationSeconds ?? 0.35;
    if (!Number.isFinite(this.dodgeDurationSeconds) || this.dodgeDurationSeconds <= 0) {
      throw new Error('Dodge duration must be a positive finite number.');
    }
  }

  public get snapshot(): PlayerCombatState {
    return { ...this.state };
  }

  public get isAttackActive(): boolean {
    if (this.state.name !== 'attack') {
      return false;
    }

    const attack = this.options.attacks[this.state.attackIndex];
    return (
      this.state.elapsedSeconds >= attack.hitStartSeconds &&
      this.state.elapsedSeconds < attack.hitEndSeconds
    );
  }

  public startAttack(): boolean {
    if (this.state.name !== 'idle' && this.state.name !== 'recovery') {
      return false;
    }

    const attackIndex =
      this.state.name === 'recovery'
        ? (this.state.attackIndex + 1) % this.options.attacks.length
        : 0;
    const attack = this.options.attacks[attackIndex];
    if (!this.stats.spendStamina(attack.staminaCost)) {
      return false;
    }

    this.state = {
      name: 'attack',
      elapsedSeconds: 0,
      attackIndex,
    };
    this.attackHitEmitted = false;
    return true;
  }

  public startDodge(): boolean {
    if (this.state.name !== 'idle' && this.state.name !== 'recovery') {
      return false;
    }

    this.state = {
      name: 'dodge',
      elapsedSeconds: 0,
      attackIndex: this.state.attackIndex,
    };
    return true;
  }

  public receiveHit(): boolean {
    if (this.state.name === 'defeated' || this.state.name === 'dodge') {
      return false;
    }

    if (this.stats.isDefeated) {
      this.state = { name: 'defeated', elapsedSeconds: 0, attackIndex: this.state.attackIndex };
      return true;
    }

    this.state = {
      name: 'hit',
      elapsedSeconds: 0,
      attackIndex: this.state.attackIndex,
    };
    return true;
  }

  public update(deltaSeconds: number): boolean {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new Error('Combat delta time must be a non-negative finite number.');
    }

    if (this.state.name === 'defeated') {
      return false;
    }

    this.state = {
      ...this.state,
      elapsedSeconds: this.state.elapsedSeconds + deltaSeconds,
    };

    if (this.state.name === 'attack') {
      return this.updateAttack();
    }
    if (this.state.name === 'recovery') {
      return this.updateRecovery();
    }
    if (this.state.name === 'dodge') {
      return this.updateDodge();
    }
    if (this.state.name === 'hit' && this.state.elapsedSeconds >= this.hitStunSeconds) {
      this.state = { ...this.state, name: 'idle', elapsedSeconds: 0 };
    }
    return false;
  }

  private updateAttack(): boolean {
    const attack = this.options.attacks[this.state.attackIndex];
    const hitStarted =
      !this.attackHitEmitted && this.state.elapsedSeconds >= attack.hitStartSeconds;
    if (hitStarted) {
      this.attackHitEmitted = true;
    }

    if (this.state.elapsedSeconds >= attack.durationSeconds) {
      this.state = { ...this.state, name: 'recovery', elapsedSeconds: 0 };
      this.attackHitEmitted = false;
    }
    return hitStarted;
  }

  private updateRecovery(): boolean {
    const attack = this.options.attacks[this.state.attackIndex];
    if (this.state.elapsedSeconds >= attack.recoverySeconds) {
      this.state = { ...this.state, name: 'idle', elapsedSeconds: 0 };
    }
    return false;
  }

  private updateDodge(): boolean {
    if (this.state.elapsedSeconds >= this.dodgeDurationSeconds) {
      this.state = { ...this.state, name: 'idle', elapsedSeconds: 0 };
    }
    return false;
  }
}
