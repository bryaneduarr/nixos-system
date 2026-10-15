# Scripts and tests

These rules are mandatory for shell scripts, standalone TypeScript tools, and tests.

## Choose the language

Use the first option that can express the behavior clearly:

1. **Nix**: declarative configuration, generated files, packaging, services, and anything evaluated at build time.
2. **Bash**: small glue that runs commands in sequence, such as rebuild wrappers and launchers, with little branching and no structured data parsing.
3. **TypeScript run by Bun**: logic that parses JSON or other structured data, keeps state, has several branches, or needs unit tests.

- Move a bash script to TypeScript when it starts parsing structured output with `jq`/`sed` pipelines or grows beyond roughly 150 lines of logic.
- Do not add new Python. Existing Python tests migrate to `bun test` or Nix evaluation tests when their subject is changed.

## Bash

- Package every script that ends up on `PATH` with `pkgs.writeShellApplication` and list its dependencies in `runtimeInputs`. Do not rely on commands that happen to be installed.
- Scripts run directly, outside Nix, start with `#!/usr/bin/env bash` and `set -euo pipefail`.
- Quote every expansion. Use arrays for argument lists. Use `local` in functions.
- Split a larger tool into `scripts/<tool>/<tool>.sh` plus focused files in `scripts/<tool>/modules/`, each with one responsibility, sourced by the entrypoint.
- Print errors to standard error and exit nonzero. Do not swallow failures with `|| true` without a comment naming the expected failure.
- Scripts must be ShellCheck-clean. Do not add `shellcheck disable` directives without a comment explaining the false positive.

## TypeScript tools

- Standalone TypeScript tools follow [typescript.md](typescript.md), run with Bun, and are packaged by Nix with their dependencies pinned by the lockfile.
- Validate command-line arguments, environment variables, files, and command output at the boundary before use.

## Tests

- Write tests when behavior needs verification: target selection, data transformations, state transitions, process control, and bug fixes. Do not test trivial configuration or constants, and do not aim for a test per function.
- Nix configuration: assert evaluated settings in `<subject>.test.nix` next to the module or host it checks, run with `nix eval --impure --file`. Assert behavior that matters (enabled services, target-specific limits), not every attribute.
- TypeScript: `bun:test` with `<responsibility>.test.ts` next to the code.
- Do not activate the system, change the active terminal, or touch real user state in tests. Mock or isolate those effects.
