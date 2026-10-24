# Update all packages

This script updates the configured Pi packages, flake inputs, and the Antigravity CLI release pin. It refreshes the related lock data, rebuilds the detected NixOS or WSL configuration, and checks installed tool versions. The final check does not start Pi RPC sessions or run extension smoke tests.

`nfu` runs this script in Zsh and Fish. WSL selects `wsl-x86_64` or `wsl-aarch64` automatically. The existing x86_64 machine with hostname `nixos` selects `nixos`. Unsupported machines stop before updates. Set `NIXOS_REBUILD_TARGET` for an explicit target.


After a successful rebuild, `nfu` runs `bun update --global --latest --no-cache`. This updates all packages in `~/.bun`, including manually installed global packages, and allows major-version upgrades.

The Bun update shares `~/.cache/bun-maintenance.lock` with Home Manager's installer and the daily cache-cleanup service. It runs `bun pm --global cache rm` after the update, even if the update fails. Cleanup removes Bun's disposable download cache, not installed packages, project dependencies, or credentials. A failed update stops `nfu` before its final version checks. `nfu` does not update project-local Bun dependencies.

T3 Code is installed separately and is not updated by this script. Run `t3code-update` to update it.
