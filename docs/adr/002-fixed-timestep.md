# ADR-002: Use a fixed simulation timestep

- Status: Accepted
- Date: 2026-10-24

## Context

Combat timing, dodge invulnerability, attack windows, cooldowns, and enemy decisions
must behave consistently across different render frame rates. A variable timestep
would make gameplay outcomes depend on rendering performance.

## Decision

Run gameplay simulation at a fixed timestep, initially targeting 60 updates per
second. Rendering runs independently through `requestAnimationFrame`. The loop will
accumulate elapsed time, cap catch-up work after long pauses, and expose simulation
time to deterministic tests.

## Alternatives considered

### Variable timestep

This is simpler to write, but timing becomes frame-rate dependent and can produce
different combat outcomes on different devices.

### Fully lockstep rendering and simulation

This simplifies the loop but makes rendering performance directly limit gameplay and
causes visible slowdowns when a frame is expensive.

## Consequences

- Gameplay timing is deterministic and testable.
- The loop needs accumulator and catch-up handling.
- A long browser suspension must be clamped to avoid a spiral of death.
- Rendering may interpolate visual state between simulation updates later.

## Revisit conditions

Reconsider the target frequency or interpolation strategy after profiling on target
devices. Do not replace the fixed simulation with a variable timestep solely to hide
rendering performance problems.
