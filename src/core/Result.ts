export type Result<T, E> = Success<T> | Failure<E>;

export type Success<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Failure<E> = {
  readonly ok: false;
  readonly error: E;
};

export const success = <T>(value: T): Success<T> => ({
  ok: true,
  value,
});

export const failure = <E>(error: E): Failure<E> => ({
  ok: false,
  error,
});

export const mapResult = <T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> => {
  if (!result.ok) {
    return result;
  }

  return success(transform(result.value));
};

export const mapError = <T, E, F>(
  result: Result<T, E>,
  transform: (error: E) => F,
): Result<T, F> => {
  if (result.ok) {
    return result;
  }

  return failure(transform(result.error));
};

export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => Result<U, E>,
): Result<U, E> => {
  if (!result.ok) {
    return result;
  }

  return transform(result.value);
};

export const unwrapResult = <T, E>(result: Result<T, E>): T => {
  if (!result.ok) {
    throw new Error(`Cannot unwrap failed result: ${String(result.error)}`);
  }

  return result.value;
};
