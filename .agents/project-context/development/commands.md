# Commands

Evidence: 2026-10-16 UTC; `eed49c0` on `pi-architecture`; source-inspected, commands run.

- `nrs [build|dry-build]` and `nfu` are commands packaged by `scripts/system-target/system-target.home.nix` and `scripts/update-all-packages/update-all-packages.home.nix`.
- Eval tests: `nix eval --impure --json --file <path>.test.nix`; they sit beside their subjects ([verification guide](../../methods/verification-and-tools.md)).
- Pi checks: `bun run check` in `packages/pi` (needs `bun install`), or `nix build .#checks.x86_64-linux.pi`.
- `check-code [paths]`: CLI diagnostics per language ([scripts/check-code](../../../scripts/check-code/check-code.sh)); on `PATH` only after activation.
