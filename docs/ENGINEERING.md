# Thornbound Engineering Guide

## Project commands

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Run the quality checks:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## Source boundaries

- `src/main.ts` is the application entry point.
- Gameplay rules belong in framework-independent TypeScript modules.
- Rendering and browser APIs should stay at the runtime boundary.
- Tests for pure logic belong under `tests/`.
- Do not commit generated output, local environment files, or credentials.

The project will use a domain/runtime separation as gameplay systems are added. Domain
code must not import Three.js or access the DOM directly.

## Change workflow

1. Start from the latest intended base branch.
2. Create a focused branch using a descriptive name, such as
   `feature/player-movement` or `fix/save-validation`.
3. Keep each commit focused on one coherent change.
4. Run the relevant checks before committing.
5. Review the staged diff and commit message.
6. Push the branch and open a pull request when the change is ready.

Do not rewrite published history or force-push unless the repository owner explicitly
approves it.

## Commit messages

Use a conventional prefix and describe the user-visible or engineering purpose:

- `feat:` for new behavior
- `fix:` for bug fixes
- `test:` for tests
- `refactor:` for behavior-preserving restructuring
- `perf:` for measured performance improvements
- `docs:` for documentation
- `chore:` for tooling and maintenance

Avoid vague messages such as `update`, `changes`, or `work`.

## Testing expectations

Pure gameplay logic should have unit tests covering normal behavior, invalid input,
boundary values, and important failure paths. Browser or rendering behavior should
use focused integration or smoke tests once those systems exist.

Before merging, the change should pass the checks relevant to its scope. The full
quality gate is type-checking, linting, formatting verification, tests, and a
production build.

## Authorship and asset rights

The project author writes the implementation. AI assistance may provide explanations,
design guidance, code review, and debugging help, but generated code must be reviewed
and understood before it is accepted.

Only original or appropriately licensed assets may be shipped. Every third-party asset
must be recorded in the repository's `LICENSES` file with its source, license, and
required attribution.
