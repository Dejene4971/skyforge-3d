export type GameStateName = 'boot' | 'loading' | 'menu' | 'playing' | 'pause';

export type GameStateContext = {
  readonly transitionTo: (state: GameStateName) => void;
};

export type GameState = {
  readonly name: GameStateName;
  readonly enter?: (context: GameStateContext) => void;
  readonly exit?: () => void;
};

export type GameStateFactory = (name: GameStateName) => GameState;

export class GameStateMachine {
  private activeState: GameState | undefined;
  private transitioning = false;
  private pendingState: GameStateName | undefined;

  public constructor(
    private readonly createState: GameStateFactory,
    private readonly initialState: GameStateName = 'boot',
  ) {}

  public get currentState(): GameStateName | undefined {
    return this.activeState?.name;
  }

  public start(): void {
    if (this.activeState) {
      throw new Error('Game state machine has already started.');
    }

    this.transitionTo(this.initialState);
  }

  public transitionTo(nextState: GameStateName): void {
    if (this.transitioning) {
      if (this.pendingState) {
        throw new Error('Only one deferred game state transition is allowed.');
      }

      this.pendingState = nextState;
      return;
    }

    this.transitioning = true;
    const previousState = this.activeState;
    const nextStateInstance = this.createState(nextState);

    try {
      previousState?.exit?.();
      this.activeState = nextStateInstance;
      nextStateInstance.enter?.({
        transitionTo: (state) => this.transitionTo(state),
      });
    } catch (error) {
      this.activeState = previousState;
      this.pendingState = undefined;
      throw error;
    } finally {
      this.transitioning = false;
    }

    const deferredState = this.pendingState;
    this.pendingState = undefined;
    if (deferredState) {
      this.transitionTo(deferredState);
    }
  }

  public stop(): void {
    this.pendingState = undefined;
    this.activeState?.exit?.();
    this.activeState = undefined;
  }
}
