# Commands

Evidence: 2026-10-15 UTC; `32ac1c9`; source-inspected, `command -v` checked.

- `nrs [build|dry-build]` runs `scripts/system-target/rebuild.sh`; `nfu` runs `scripts/update-all-packages/update-all-packages.sh` ([commands.zsh](../../../scripts/system-target/commands.zsh)).
- Eval tests: `nix eval --impure --json --file <path>.test.nix`; they sit beside their subjects ([verification guide](../../methods/verification-and-tools.md)).
- Pi tests: `bun test` in `home/packages/pi`; no tsconfig or type check exists.
- Declared in `home/packages.nix`: statix, deadnix, nixfmt, nil, bun, biome, shellcheck, shfmt, stylua, lua-language-server. The last four reach `PATH` only after the next activation.
