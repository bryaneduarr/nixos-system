# Commands

Evidence: 2026-10-15 UTC; `e5b5d36` plus uncommitted reorganization; source-inspected, `command -v` checked.

- `nrs [build|dry-build]` and `nfu` are commands packaged by `scripts/system-target/system-target.home.nix` and `scripts/update-all-packages/update-all-packages.home.nix`.
- Eval tests: `nix eval --impure --json --file <path>.test.nix`; they sit beside their subjects ([verification guide](../../methods/verification-and-tools.md)).
- Pi tests: `bun test` in `packages/pi`; no tsconfig or type check exists.
- Tools come from `packages/nix-tools/` (statix, deadnix, nixfmt, nil) and `packages/development-tools/` (biome, shellcheck, shfmt, stylua, lua-language-server); new tools need activation.
