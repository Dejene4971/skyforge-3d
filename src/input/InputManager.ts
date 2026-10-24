import {
  clampInputVector,
  emptyInputCommand,
  type InputCommand,
  type InputVector2,
} from './InputCommands';

export class InputManager {
  private command: InputCommand = emptyInputCommand();

  public get snapshot(): InputCommand {
    return this.command;
  }

  public setMove(vector: InputVector2): void {
    this.command = {
      ...this.command,
      move: clampInputVector(vector),
    };
  }

  public setLook(vector: InputVector2): void {
    this.command = {
      ...this.command,
      look: vector,
    };
  }

  public setAction(
    action: keyof Pick<
      InputCommand,
      'attack' | 'dodge' | 'parry' | 'interact' | 'usePotion' | 'lockOn' | 'pause'
    >,
    pressed: boolean,
  ): void {
    this.command = {
      ...this.command,
      [action]: pressed,
    };
  }

  public reset(): void {
    this.command = emptyInputCommand();
  }
}
