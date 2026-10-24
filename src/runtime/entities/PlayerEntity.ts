import * as THREE from 'three';
import { PlayerDodge, type DodgeOptions } from '../../domain/player/Dodge';
import {
  PlayerMovement,
  type MovementState,
  type MovementVector,
} from '../../domain/player/Movement';

export type PlayerEntityOptions = {
  readonly movement?: ConstructorParameters<typeof PlayerMovement>[0];
  readonly dodge?: DodgeOptions;
  readonly initialState?: MovementState;
  readonly visual?: THREE.Object3D;
};

export class PlayerEntity {
  public readonly object: THREE.Object3D;
  public readonly movement: PlayerMovement;
  public readonly dodge: PlayerDodge;

  public constructor(options: PlayerEntityOptions = {}) {
    this.object = options.visual ?? new THREE.Group();
    this.object.name = 'player';
    this.movement = new PlayerMovement(options.movement, options.initialState);
    this.dodge = new PlayerDodge(options.dodge);
    this.applyMovementState(this.movement.snapshot);
  }

  public update(input: MovementVector, deltaSeconds: number): MovementState {
    const state = this.movement.update(input, deltaSeconds);
    this.dodge.update(deltaSeconds);
    this.applyMovementState(state);
    return state;
  }

  public startDodge(): boolean {
    return this.dodge.start();
  }

  public get isInvulnerable(): boolean {
    return this.dodge.snapshot.invulnerable;
  }

  public reset(state?: MovementState): void {
    this.dodge.reset();
    this.applyMovementState(this.movement.reset(state));
  }

  private applyMovementState(state: MovementState): void {
    this.object.position.set(state.position.x, 0, state.position.z);
    this.object.rotation.y = state.facingRadians;
  }
}
