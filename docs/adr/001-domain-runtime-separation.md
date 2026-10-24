# ADR-001: Separate gameplay domain from runtime adapters

- Status: Accepted
- Date: 2026-10-24

## Context

Combat, progression, inventory, save validation, and other gameplay rules need to
remain testable without a browser or WebGL context. Three.js objects and browser APIs
also have lifetimes and failure modes that should not determine the shape of those
rules.

## Decision

Keep gameplay rules in framework-independent domain modules. Runtime modules adapt
those rules to Three.js, browser input, audio, and persistence services.

Domain modules must not import Three.js or access the DOM directly. Runtime modules
translate input into domain commands and translate domain events into visual, audio,
or UI effects.

## Alternatives considered

### Put gameplay directly in Three.js classes

This is initially quick, but it couples combat and progression to rendering objects,
making headless tests and later rendering changes expensive.

### Use a general-purpose game framework

This could provide conventions and utilities, but it would introduce an external
architecture before the project's actual requirements are known.

## Consequences

- Pure game logic can be tested with Vitest.
- Runtime adapters require explicit interfaces.
- Some features need more coordination than a single Three.js class would.
- Visual prototypes must use small adapters instead of placing rules in meshes.

## Revisit conditions

Reconsider this boundary only if profiling or implementation evidence shows that the
translation cost is materially affecting the frame budget or development velocity.
