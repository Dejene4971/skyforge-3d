import * as THREE from 'three';
import {
  PlayerMovement,
  type MovementState,
  type MovementVector,
} from '../../domain/player/Movement';

export type PlayerEntityOptions = {
  readonly movement?: ConstructorParameters<typeof PlayerMovement>[0];
  readonly initialState?: MovementState;
  readonly visual?: THREE.Object3D;
};

export class PlayerEntity {
  public readonly object: THREE.Object3D;
  public readonly movement: PlayerMovement;

  public constructor(options: PlayerEntityOptions = {}) {
    this.object = options.visual ?? new THREE.Group();
    this.object.name = 'player';
    this.movement = new PlayerMovement(options.movement, options.initialState);
    this.applyMovementState(this.movement.snapshot);
  }

  public update(input: MovementVector, deltaSeconds: number): MovementState {
    const state = this.movement.update(input, deltaSeconds);
    this.applyMovementState(state);
    return state;
  }

  public reset(state?: MovementState): void {
    this.applyMovementState(this.movement.reset(state));
  }

  private applyMovementState(state: MovementState): void {
    this.object.position.set(state.position.x, 0, state.position.z);
    this.object.rotation.y = state.facingRadians;
  }
}
