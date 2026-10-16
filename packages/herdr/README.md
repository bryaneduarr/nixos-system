# Herdr tab bar toggle

Herdr comes from nixpkgs and Home Manager installs it through `home/packages.nix`. An overlay in this directory adds one patch to the nixpkgs build. The patch adds a tab bar toggle that upstream Herdr does not have yet. Everything else in the package, including the source, version, and dependency hashes, comes from the locked nixpkgs.

## Use the toggle

Press `Ctrl+B`, then `T`, to hide or show the tab bar. When the bar is hidden, Herdr gives its row to the panes and resizes them.

The toggle belongs to one attached client. Hiding the bar in one terminal does not hide it in another terminal attached to the same session. The server, the panes, and the saved session do not change.

This configuration sets the bar to start hidden:

```toml
[ui]
tab_bar_start_hidden = true
```

The keybinding uses the normal `[keys]` syntax. The default is `prefix+t`, so the configuration does not set it. To use a different key, add this line to the `[keys]` section in `default.nix`:

```toml
toggle_tab_bar = "prefix+alt+t"
```

A user binding always takes priority over a default binding. If you bind `prefix+t` to another action or to a `[[keys.command]]` entry, that binding keeps working and the default toggle binding is dropped without a warning. `prefix+shift+t` still renames the tab.

### Single-tab auto-hide

`hide_tab_bar_when_single_tab` still works. Herdr decides whether to show the bar in this order:

1. After you press the toggle, the bar stays in the state you picked until the client exits. The tab count no longer matters.
2. If `tab_bar_start_hidden = true`, a new client starts with the bar hidden. This counts as a choice made with the toggle.
3. Otherwise, the bar is visible unless `hide_tab_bar_when_single_tab = true` and the workspace has one tab.

`herdr server reload-config` does not change a choice made with the toggle. A change to `tab_bar_start_hidden` applies to the next client you start.

## Install or update Herdr

`nfu` updates all flake inputs, including nixpkgs, and then rebuilds. A new Herdr release in nixpkgs arrives through that update, and the build applies the patch again.

The commands in this file use `herdr_package`, the patched Herdr of the configuration this machine runs. This machine runs `wsl-aarch64`. On another machine, use `wsl-x86_64` or `nixos` instead. Run the commands from the repository root:

```sh
herdr_package='.#nixosConfigurations.wsl-aarch64.pkgs.herdr'
```

To check that a Herdr update still builds with the patch before you switch, run:

```sh
nix flake update nixpkgs
nix build --no-link --print-build-logs "$herdr_package"
nrs build
nrs
```

`nrs build` builds the full system without activating it. `nrs` switches to it. If the patch fails, the build stops and the installed generation stays active.

After the switch, the running Herdr server keeps the old binary, and its panes keep running. To use the new client, detach with `Ctrl+B`, then `Q`, and run `herdr` again. The tab bar toggle runs in the client, so the server does not need a restart.

The old server reads the shared `config.toml` and does not know `tab_bar_start_hidden`. It ignores that key, applies the other settings, and every client shows `config.toml has unknown keys; herdr config check` in the top-right corner. The notice stays until the server restarts on the patched binary. `herdr server stop` stops every pane process in the session, so run it only when you can lose those processes. The next `herdr` starts a patched server and restores the saved workspaces and tabs.

## Fix a patch that no longer applies

If the build fails in `patchPhase`, Herdr upstream changed the code the patch touches. The installed Herdr keeps working because the switch did not run.

1. Find the new version and source:

   ```sh
   nix eval --raw "$herdr_package.version"
   nix build --no-link --print-out-paths "$herdr_package.src"
   ```

2. Copy the source to a writable directory, run `git init`, and commit it.
3. Run `git apply --3way` with `patches/toggle-tab-bar.patch` and resolve the conflicts. Keep the change as small as before.
4. Run `cargo nextest run` and the manual checks below.
5. Write the result back with `git diff > patches/toggle-tab-bar.patch`, and copy the description lines from the top of the old patch. Update the base version in them.
6. Build again with the commands in the previous section.

To keep the old Herdr while you work on the patch, revert `flake.lock` with `git checkout flake.lock`. That also keeps every other package at its old version.

## Check the installed binary

```sh
readlink -f "$(command -v herdr)"
herdr --version
herdr --default-config | grep -n 'toggle_tab_bar\|tab_bar_start_hidden'
```

The path is a Nix store path in `herdr-<version>`. If `herdr --default-config` prints both settings, the patched build is installed.

To try a build without touching your session, start it with its own config directory. Herdr keeps the socket and session files in that directory, so the test server is separate from your main session:

```sh
herdr_test="$(nix build --no-link --print-out-paths "$herdr_package")"
test_home="$(mktemp -d)"
mkdir -p "$test_home/herdr"
printf 'onboarding = false\n\n[ui]\ntab_bar_start_hidden = true\n' > "$test_home/herdr/config.toml"
env -u HERDR_SOCKET_PATH -u HERDR_CLIENT_SOCKET_PATH -u HERDR_ENV \
	XDG_CONFIG_HOME="$test_home" XDG_STATE_HOME="$test_home/state" "$herdr_test/bin/herdr"
```

When you finish, stop the test server with the same `env` prefix and `"$herdr_test/bin/herdr" server stop`. Without that prefix, the command stops your main server.

## Roll back

To go back to the previous system generation, which also restores the previous Herdr and `config.toml`, run:

```sh
sudo nixos-rebuild switch --rollback
```

To remove the patch permanently:

1. Delete `overlay.nix` and the `patches` directory.
2. Remove `herdrOverlay` from `flake.nix`.
3. Remove `tab_bar_start_hidden` from `default.nix`.
4. Run `nrs build`, then `nrs`.

## Check for upstream support

Before you fix a failed patch, check whether Herdr added the feature itself. Search the new source for a tab bar toggle:

```sh
grep -rn 'toggle_tab_bar\|tab_bar_start_hidden\|ToggleTabBar' "$(nix build --no-link --print-out-paths "$herdr_package.src")/src"
```

Also read the [configuration reference](https://herdr.dev/docs/config-reference/). If upstream has an equivalent setting, remove the patch with the steps in the previous section and switch the configuration to the upstream names.

Herdr closes unsolicited pull requests, as its `CONTRIBUTING.md` explains. To ask for the feature upstream, open a GitHub Discussion on `herdrdev/herdr` that describes the use case.

## Where the change lives

| Part | File |
| --- | --- |
| Nix patch and overlay | `overlay.nix`, `patches/toggle-tab-bar.patch`, `herdrOverlay` in `flake.nix` |
| Herdr configuration | `default.nix` |
| Visibility state | `src/client/shell/state.rs` (`tab_bar_visibility_override`, `tab_bar_visible`) |
| Keyboard action | `src/client/shell/actions.rs`, `src/input/keybindings.rs`, `src/config/keybinds.rs` |
| Layout and rendering | `src/client/shell/config.rs` (`layout`) |
| Config option | `src/config/model.rs` |

The `src/` paths are in the upstream Herdr source after the patch applies.
