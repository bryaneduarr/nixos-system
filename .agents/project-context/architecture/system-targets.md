# System targets

Evidence: 2026-10-15 UTC; `e5b5d36` plus uncommitted reorganization; evaluated, not activated.

- [flake.nix](../../../flake.nix) builds `nixos` ([hosts/desktop](../../../hosts/desktop/desktop.nix)) and `wsl-x86_64`/`wsl-aarch64` ([hosts/wsl](../../../hosts/wsl/wsl.nix)) through one `nixosTarget` function; each host also has `<target>.home.nix`.
- Desktop-only features are enabled only in desktop host files; WSL leaves them off.
- `scripts/system-target/select-target.sh` picks the target from hostname and architecture; `NIXOS_REBUILD_TARGET` overrides it.
- WSL build limits live in `hosts/wsl/build-limits.nix`; `hosts/wsl/wsl.test.nix` asserts them.
