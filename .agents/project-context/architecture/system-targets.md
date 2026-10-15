# System targets

Evidence: 2026-10-15 UTC; `32ac1c9`; source-inspected only.

- [flake.nix](../../../flake.nix) defines `nixos` (desktop, `hosts/configuration.nix` + `home/default.nix`) and `wsl-x86_64`/`wsl-aarch64` (`hosts/wsl.nix` + `home/wsl.nix`).
- Home Manager receives an untyped `desktopTools` special argument to switch desktop tools; planned to become typed options.
- `scripts/system-target/select-target.sh` picks the target from hostname and architecture; `NIXOS_REBUILD_TARGET` overrides it.
- WSL limits builds to one job and two cores; [hosts/wsl.test.nix](../../../hosts/wsl.test.nix) asserts this.
