# Update all packages

This script updates the configured Pi packages and flake inputs. It refreshes the related lock data, rebuilds the detected NixOS or WSL configuration, and verifies Pi.

`nfu` runs this script in Zsh and Fish. WSL selects `wsl-x86_64` or `wsl-aarch64` automatically. The existing x86_64 machine with hostname `nixos` selects `nixos`. Unsupported machines stop before updates. Set `NIXOS_REBUILD_TARGET` for an explicit target.

If your current Zsh session still uses `dot-files.nix`, load the new functions before running `nfu`:

```zsh
source ~/nixos-system/scripts/system-target/commands.zsh
```

See [Migrate NixOS-WSL](../../WSL.md) for bootstrap commands and validation.

T3 Code is installed separately and is not updated by this script. See [Update T3 Code](../../home/packages/t3code/README.md).
