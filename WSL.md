# Migrate NixOS-WSL

Use this repository inside an existing NixOS-WSL installation. These instructions do not apply to Ubuntu or another distribution inside WSL.

## Prepare the repository

1. Place the repository at `~/nixos-system` inside WSL.
2. Back up your current configuration and any manually edited Neovim files. Home Manager replaces `~/.config/nvim` during activation.
3. Review `hosts/services.nix`. WSL enables Docker, PostgreSQL, Tailscale, and SSH, as the old configuration did.
4. Review your firewall and SSH access before the first rebuild.

The WSL configuration preserves `system.stateVersion` and `home.stateVersion` at `25.05`. Do not raise these values as part of migration.

## Check the selected configuration

Run this command from the repository:

```bash
bash -c 'source scripts/system-target/select-target.sh; select_system_target && printf "%s\n" "$rebuild_target"'
```

WSL selects `wsl-x86_64` or `wsl-aarch64` from the architecture. The existing physical machine selects `nixos` when its hostname is `nixos` and its architecture is x86_64. Unregistered native hosts and native ARM machines stop without changing anything.

## Rebuild for the first time

Your current shell functions may still point to the old repository. In Zsh, replace them for the current session before using `nrs` or `nfu`:

```zsh
source ~/nixos-system/scripts/system-target/commands.zsh
type nrs nfu
```

Both function bodies must point to `nixos-system`, not `dot-files.nix`. Using the old `nfu` reinstalls the old configuration, even after a successful migration.

Invoke the new rebuild script directly:

```bash
bash ~/nixos-system/scripts/system-target/rebuild.sh
```

The script prints the configuration before running `sudo nixos-rebuild switch`. WSL builds use one simultaneous job and two cores per build to reduce memory use. The flags protect the first rebuild, and `hosts/wsl.nix` keeps these limits for later Nix builds. Native desktop limits do not change. The WSL Python DuckDB package also limits its CMake and scikit-build tasks to one compiler process because its build system can ignore Nix's core limit. WSL disables the upstream test suites for Sentence Transformers and Torchaudio and removes their test-only dependencies. This avoids large audio-model tests and extra machine-learning packages that are not needed for terminal use. Basic Python import checks remain enabled. These overrides do not change desktop packages.

After a successful rebuild, start a new Zsh or Fish session.

## Use the installed commands

Run `nrs` to rebuild the detected configuration. Run `nfu` to update Pi dependencies and flake inputs, refresh the Pi dependency hash, rebuild the detected configuration, and verify Pi.

The update-all script runs the same pipeline:

```bash
bash ~/nixos-system/scripts/update-all-packages/update-all-packages.sh
```

Both commands work outside the repository. They use `~/nixos-system` and its lock file. A flake update changes the dependency versions for all configurations, but WSL rebuilds only its terminal tools and services. The pipeline does not update desktop applications separately.

To inspect a rebuild without activating it, run:

```bash
bash ~/nixos-system/scripts/system-target/rebuild.sh dry-build
```

Use `nrs build` to build without activation, or `nrs dry-build` to inspect the build plan after the new shell functions are installed.

If you need an explicit target, set `NIXOS_REBUILD_TARGET` to `nixos`, `wsl-x86_64`, or `wsl-aarch64`. Use an override only when that configuration matches the machine. Native machines need the correct hardware configuration, not just a matching architecture.

## Check terminal applications

Verify Neovim, Pi, OpenCode, Codex, tmux, and Yazi after activation. OpenCode and Codex install through Bun during Home Manager activation and need network access. A Nix evaluation does not prove that these downloads succeeded. Authentication stays separate from configuration.

Neovim and tmux use OSC 52 clipboard support inside WSL. Enable OSC 52 in your terminal. Clipboard paste also depends on whether the terminal permits clipboard queries.

Keep `dot-files.nix` as a backup until these checks pass. Future changes belong in `nixos-system`.

## Run the configuration tests

```bash
cd ~/nixos-system
python3 scripts/system-target/tests/test_commands.py
REPO_ROOT="$PWD" nix eval --impure --json --file tests/wsl-settings.nix
```

The shell tests mock rebuild and update commands. They do not activate a system. The Nix test evaluates both WSL architectures and checks terminal tools, services, and desktop exclusions.
