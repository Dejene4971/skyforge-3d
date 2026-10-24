export type InputVector2 = {
  readonly x: number;
  readonly y: number;
};

export type InputCommand = {
  readonly move: InputVector2;
  readonly look: InputVector2;
  readonly attack: boolean;
  readonly dodge: boolean;
  readonly parry: boolean;
  readonly interact: boolean;
  readonly usePotion: boolean;
  readonly lockOn: boolean;
  readonly pause: boolean;
};

export const emptyInputCommand = (): InputCommand => ({
  move: { x: 0, y: 0 },
  look: { x: 0, y: 0 },
  attack: false,
  dodge: false,
  parry: false,
  interact: false,
  usePotion: false,
  lockOn: false,
  pause: false,
});

export const clampInputVector = (vector: InputVector2): InputVector2 => {
  const length = Math.hypot(vector.x, vector.y);
  if (length <= 1) {
    return vector;
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};
