# Update T3 Code

Home Manager installs missing T3 Code desktop and CLI binaries during activation. The default installation channel is nightly. It does not pin, upgrade, or downgrade existing versions.

The desktop AppImage lives at `~/.local/share/t3code/T3-Code.AppImage`. The upstream CLI installer puts `t3` in `~/.local/bin/` and its runtime under `~/.t3/`. Nix manages the installer and the AppImage compatibility launcher, not the T3 binaries.

## Update the desktop app

Finish active work and close the desktop app before you update it.

```sh
t3code-update
t3code
```

To choose a stable release instead, run `T3CODE_CHANNEL=stable t3code-update`. To install a specific desktop release, run `T3CODE_VERSION=0.0.45 t3code-update` with the version you want.

The installer checks the AppImage against the SHA-256 digest published with its GitHub release before replacing it. If the download or verification fails, the existing AppImage stays intact.

The launcher's built-in desktop updater is disabled because its restart bypasses the NixOS AppImage compatibility launcher. Use `t3code-update` instead. This command does not rebuild NixOS or change the CLI version.

## Update the CLI

```sh
t3 update
```

Use `t3 update --channel nightly` or `t3 update --channel stable` to change channels. A CLI update can restart the background service, so finish active work first. See the [upstream service guide](https://github.com/pingdotgg/t3code/blob/main/docs/user/background-service.md).

## Retry installation

If the first activation cannot reach the release server, run `t3code-install` when you have a connection. It installs missing binaries without updating existing ones. Rebuilds and `update-all-packages.sh` do not update T3 Code.

Desktop callbacks use `t3code-local.desktop`, which points to the stable NixOS launcher. Hyprland's desktop-specific MIME default keeps T3's own callback registration from bypassing that launcher.

## Verify installer changes

Run the tests from the repository root. They use mocked release downloads and do not change your installed binaries.

```sh
python3 -B -m unittest discover -s home/packages/t3code/tests -v
```
