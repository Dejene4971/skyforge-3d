import { describe, expect, it } from 'vitest';
import { PlayerDodge } from '../../../src/domain/player/Dodge';

describe('PlayerDodge', () => {
  it('starts with no active dodge and can start immediately', () => {
    const dodge = new PlayerDodge();

    expect(dodge.canStart).toBe(true);
    expect(dodge.start()).toBe(true);
    expect(dodge.snapshot).toMatchObject({
      active: true,
      elapsedSeconds: 0,
      invulnerable: true,
    });
  });

  it('rejects starts while active or cooling down', () => {
    const dodge = new PlayerDodge({ durationSeconds: 0.3, cooldownSeconds: 0.5 });

    expect(dodge.start()).toBe(true);
    expect(dodge.start()).toBe(false);
    dodge.update(0.3);
    expect(dodge.snapshot.active).toBe(false);
    expect(dodge.start()).toBe(false);
    dodge.update(0.2);
    expect(dodge.canStart).toBe(true);
  });

  it('ends invulnerability before the dodge ends', () => {
    const dodge = new PlayerDodge({
      durationSeconds: 0.4,
      invulnerabilitySeconds: 0.15,
    });

    dodge.start();
    dodge.update(0.2);

    expect(dodge.snapshot.active).toBe(true);
    expect(dodge.snapshot.invulnerable).toBe(false);
    dodge.update(0.2);
    expect(dodge.snapshot.active).toBe(false);
    expect(dodge.snapshot.elapsedSeconds).toBe(0);
  });

  it('clears active and cooldown state when reset', () => {
    const dodge = new PlayerDodge();

    dodge.start();
    dodge.reset();

    expect(dodge.snapshot).toEqual({
      active: false,
      elapsedSeconds: 0,
      cooldownRemainingSeconds: 0,
      invulnerable: false,
    });
  });

  it('rejects invalid timing configuration and deltas', () => {
    expect(() => new PlayerDodge({ durationSeconds: 0 })).toThrow(
      'Dodge duration must be a positive finite number.',
    );
    expect(() => new PlayerDodge({ cooldownSeconds: -1 })).toThrow(
      'Dodge cooldown must be a non-negative finite number.',
    );
    expect(() => new PlayerDodge({ durationSeconds: 0.1, invulnerabilitySeconds: 0.2 })).toThrow(
      'Dodge invulnerability duration cannot exceed dodge duration.',
    );

    const dodge = new PlayerDodge();
    expect(() => dodge.update(-1)).toThrow(
      'Dodge delta time must be a non-negative finite number.',
    );
  });
});
