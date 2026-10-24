export type MovementVector = {
  readonly x: number;
  readonly y: number;
};

export type MovementState = {
  readonly position: {
    readonly x: number;
    readonly z: number;
  };
  readonly velocity: MovementVector;
  readonly facingRadians: number;
};

export type MovementOptions = {
  readonly maxSpeed?: number;
  readonly acceleration?: number;
  readonly deceleration?: number;
};

export class PlayerMovement {
  private state: MovementState;
  private readonly maxSpeed: number;
  private readonly acceleration: number;
  private readonly deceleration: number;

  public constructor(options: MovementOptions = {}, initialState?: MovementState) {
    this.maxSpeed = options.maxSpeed ?? 5;
    this.acceleration = options.acceleration ?? 30;
    this.deceleration = options.deceleration ?? 40;
    this.state = initialState ?? {
      position: { x: 0, z: 0 },
      velocity: { x: 0, y: 0 },
      facingRadians: 0,
    };

    validatePositive(this.maxSpeed, 'Maximum speed');
    validatePositive(this.acceleration, 'Acceleration');
    validatePositive(this.deceleration, 'Deceleration');
    validateState(this.state);
  }

  public get snapshot(): MovementState {
    return {
      position: { ...this.state.position },
      velocity: { ...this.state.velocity },
      facingRadians: this.state.facingRadians,
    };
  }

  public reset(
    state: MovementState = {
      position: { x: 0, z: 0 },
      velocity: { x: 0, y: 0 },
      facingRadians: 0,
    },
  ): MovementState {
    validateState(state);
    this.state = {
      position: { ...state.position },
      velocity: { ...state.velocity },
      facingRadians: state.facingRadians,
    };
    return this.snapshot;
  }

  public update(input: MovementVector, deltaSeconds: number): MovementState {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new Error('Movement delta time must be a non-negative finite number.');
    }

    const desiredDirection = normalize(input);
    const desiredVelocity = {
      x: desiredDirection.x * this.maxSpeed,
      y: desiredDirection.y * this.maxSpeed,
    };
    const rate =
      desiredDirection.x === 0 && desiredDirection.y === 0 ? this.deceleration : this.acceleration;
    const maximumChange = rate * deltaSeconds;
    const velocity = moveTowards(this.state.velocity, desiredVelocity, maximumChange);

    this.state = {
      position: {
        x: this.state.position.x + velocity.x * deltaSeconds,
        z: this.state.position.z + velocity.y * deltaSeconds,
      },
      velocity,
      facingRadians:
        desiredDirection.x === 0 && desiredDirection.y === 0
          ? this.state.facingRadians
          : Math.atan2(desiredDirection.x, desiredDirection.y),
    };

    return this.snapshot;
  }
}

const normalize = (vector: MovementVector): MovementVector => {
  if (!Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
    throw new Error('Movement input must contain finite numbers.');
  }

  const length = Math.hypot(vector.x, vector.y);
  if (length <= 1) {
    return vector;
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};

const moveTowards = (
  current: MovementVector,
  target: MovementVector,
  maximumChange: number,
): MovementVector => ({
  x: moveScalarTowards(current.x, target.x, maximumChange),
  y: moveScalarTowards(current.y, target.y, maximumChange),
});

const moveScalarTowards = (current: number, target: number, maximumChange: number): number => {
  const difference = target - current;
  if (Math.abs(difference) <= maximumChange) {
    return target;
  }

  return current + Math.sign(difference) * maximumChange;
};

const validatePositive = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
};

const validateState = (state: MovementState): void => {
  const values = [
    state.position.x,
    state.position.z,
    state.velocity.x,
    state.velocity.y,
    state.facingRadians,
  ];

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error('Initial movement state must contain finite numbers.');
  }
};
