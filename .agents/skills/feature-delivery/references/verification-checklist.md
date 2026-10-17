# Verification checklist

Record every item before the first worker starts (baseline) and again before hand-off. Report numbers, not adjectives. Say plainly what was not verified.

## Static checks

- Project check for every TypeScript project touched: type errors, lint, unused code, tests (Pi: `bun run check`).
- Rule audit through `check-code <paths>`; findings outside the exceptions table in `.agents/rules/<project>-rule-audit.md` must be zero, and stale allowlist entries are errors.
- `check-code` on every changed path for the other languages (Nix, shell, Lua).
- Flake checks for the current system: `nix build .#checks.<system>.<check>`. Checks for other systems run only on those machines; list them as not yet run.

## Build and install

- Evaluate every target: `nixos`, `wsl-x86_64`, `wsl-aarch64`.
- Build every affected package. For refactors, compare outputs with the baseline build (`diff -r`); identical output proves the packaged result did not change.
- Inspect installed trees that changed: required entry files present, tests and test doubles absent, and the installed file count equal to the source runtime file count.

## Behavior evidence

- Registration tests: each entry point registers the expected tools, commands, shortcuts, and events. Update the expected list only for intended changes.
- Processes that run outside the main runtime, such as detached workers, run once on the production runtime version.
- Third-party imports mapped for types only resolve to the real module at runtime.
- Every behavior change a worker reports is either reverted or listed for the user.

## Documentation

- Search documentation for every moved or deleted path and update stale references.
- No README or review file was added for review purposes.

## Not verified unless stated

- Runtime inside the real application (needs activation by the user).
- Systems without a local builder.
- Interactive terminal behavior beyond tests.
